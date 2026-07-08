import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini if key exists
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/blur-license-plate", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
    }
    
    try {
      const { imageBase64, imageUrl } = req.body;
      if (!imageBase64 && !imageUrl) {
        return res.status(400).json({ error: "Missing image data or URL" });
      }

      let base64Data = "";
      let mimeType = "image/jpeg";
      let fullBase64Image = "";

      if (imageUrl) {
        try {
          const imageRes = await fetch(imageUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "Accept-Language": "en-US,en;q=0.9",
              "Referer": new URL(imageUrl).origin
            }
          });
          if (!imageRes.ok) {
            throw new Error(`Failed to fetch image: ${imageRes.statusText}`);
          }
          const contentType = imageRes.headers.get("content-type");
          if (contentType) {
            mimeType = contentType;
          }
          const arrayBuffer = await imageRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          base64Data = buffer.toString("base64");
          fullBase64Image = `data:${mimeType};base64,${base64Data}`;
        } catch (fetchErr: any) {
          console.warn("Failed to fetch imageUrl:", fetchErr.message);
          return res.json({ bbox: [], base64Image: imageUrl });
        }
      } else {
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        fullBase64Image = imageBase64;
        
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        }
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                  }
                },
                {
                  text: "Find the exact bounding box of the license plate on the car in this image. The license plate may be in English, Cambodian (Khmer, which is a white rectangular plate with a red border, containing blue text like 'ភ្នំពេញ' or other Khmer text on top, and alphanumeric characters like '2CH-5590' or '2CA-0980' on the bottom), or any other language. Look on the front and rear bumpers. Return ONLY a JSON array of 4 integers: [ymin, xmin, ymax, xmax] representing the exact license plate bounding box normalized from 0 to 1000. If no plate is found, return []."
                }
              ]
            }
          ],
          config: {
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.INTEGER
                  },
                  description: "A JSON array of exactly 4 integers [ymin, xmin, ymax, xmax] normalized from 0 to 1000 representing the bounding box of the license plate. Return [] if no license plate is detected."
              }
          }
        });
      } catch (geminiError: any) {
        console.error("Gemini Error:", geminiError);
        return res.json({ bbox: [], base64Image: fullBase64Image });
      }

      const text = response.text;
      console.log("Gemini response text:", text);

      let bbox: number[] = [];
      if (text) {
          try {
              const cleanText = text.trim();
              const parsed = JSON.parse(cleanText);
              
              if (Array.isArray(parsed) && parsed.length === 4) {
                  bbox = parsed;
                  const height = Math.abs(bbox[2] - bbox[0]);
                  const width = Math.abs(bbox[3] - bbox[1]);
                  if (height < 10 || width < 10) {
                      console.warn("Gemini returned a bounding box that is too small, ignoring it", bbox); 
                      bbox = [];
                  }
              }
          } catch(e) {
              console.error("JSON parse error:", e);
          }
      }

      res.json({ bbox, base64Image: fullBase64Image });
    } catch (error: any) {
      console.error("Outer Error:", error);
      res.status(500).json({ error: "Failed to detect license plate", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
// update
