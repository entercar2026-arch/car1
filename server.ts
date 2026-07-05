import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing image" });
      }

      // Strip "data:image/jpeg;base64," prefix
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let base64Data = imageBase64;
      let mimeType = "image/jpeg";
      
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
                text: "Detect the bounding box of the car license plate in this image. Return the bounding box in [ymin, xmin, ymax, xmax] format normalized from 0 to 1000. If there are multiple, return the largest one. If there is no license plate, return []."
              }
            ]
          }
        ],
        config: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
                type: "array",
                items: {
                    type: "integer"
                }
            }
        }
      });

      const text = response.text();
      let bbox: number[] = [];
      if (text) {
          try {
              bbox = JSON.parse(text);
          } catch(e) {}
      }

      res.json({ bbox });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to detect license plate" });
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
