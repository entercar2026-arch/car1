import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on Vercel" });
  }

  const ai = new GoogleGenAI({ apiKey });

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
          throw new Error(`Failed to fetch image at ${imageUrl}: ${imageRes.statusText}`);
        }
        const contentType = imageRes.headers.get("content-type");
        if (contentType) {
          mimeType = contentType;
        }
        const arrayBuffer = await imageRes.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString("base64");
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

    const maxRetries = 3;
    let response: any = null;
    let lastError: any = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const modelToUse = attempt === maxRetries - 1 ? "gemini-2.0-flash" : "gemini-2.5-flash";
        response = await ai.models.generateContent({
          model: modelToUse,
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
                  text: "Find the car license plate in this image. Return the bounding box of the license plate in [ymin, xmin, ymax, xmax] format normalized from 0 to 1000. Even if it's small, angled, or contains non-English characters, detect it. Your output must be ONLY a valid JSON array of 4 integers. If there is absolutely no license plate, return []."
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
        break; // Success, exit retry loop
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini attempt ${attempt + 1} failed:`, err.message);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5s before retry
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to generate content after retries");
    }

    const text = response.text;
    let bbox: number[] = [];
    if (text) {
        try {
            const cleanText = text.replace(/```(json)?/g, '').trim();
            bbox = JSON.parse(cleanText);
        } catch(e) {}
    }

    res.json({ bbox, base64Image: fullBase64Image });
  } catch (error) {
    console.warn("Gemini Error:", error);
    res.status(500).json({ error: "Failed to detect license plate" });
  }
}
