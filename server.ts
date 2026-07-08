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

      let response = null;
      let usedModel = "";
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];

      for (const model of modelsToTry) {
        try {
          console.log(`Attempting license plate detection with model: ${model}`);
          response = await ai.models.generateContent({
            model: model,
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
                    text: "You are an expert vehicle registration plate detector. Your job is to locate the exact bounding box of the license plate on the car shown in the image.\n\n" +
                          "Look extremely closely for the following types of license plates:\n" +
                          "1. Cambodian (Khmer) plates (highly common): These are horizontal rectangular plates with a white background and a thin red border. They contain Khmer text at the top (e.g., 'ភ្នំពេញ' or other province names) and blue/black alphanumeric text at the bottom (e.g., '2CK-2010', '2CH-5590', '2CA-0980').\n" +
                          "2. Standard rectangular plates: Any white, yellow, blue, black, or colored license plate on the front bumper/grille or rear trunk/tailgate/bumper.\n\n" +
                          "License plates on hatchbacks (like a Toyota Prius), SUVs, or vans are often located higher up on the rear trunk/tailgate (directly under the brand logo or between the tail lights), rather than low down on the bumper. Look there carefully.\n\n" +
                          "Even if the license plate is tilted, angled, or shot from a three-quarters perspective, find its exact boundaries.\n\n" +
                          "Output requirements:\n" +
                          "- Find the EXACT boundaries of the license plate.\n" +
                          "- Return ONLY a JSON array of 4 integers: [ymin, xmin, ymax, xmax] normalized from 0 to 1000 (0 is top/left, 1000 is bottom/right).\n" +
                          "- Return [] if there is absolutely no car or no license plate visible in the image."
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
          usedModel = model;
          break; // Stop loop if successful
        } catch (geminiError: any) {
          console.warn(`Gemini model ${model} failed:`, geminiError.message || geminiError);
        }
      }

      if (!response) {
        console.error("All Gemini models failed for license plate detection.");
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
                  if (height < 1 || width < 1) {
                      console.warn("Gemini returned an invalid zero-size bounding box, ignoring it", bbox); 
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
