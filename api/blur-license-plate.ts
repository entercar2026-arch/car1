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
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          throw new Error(`Failed to fetch image: ${imageRes.statusText}`);
        }
        const contentType = imageRes.headers.get("content-type");
        if (contentType) {
          mimeType = contentType;
        }
        const arrayBuffer = await imageRes.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString("base64");
        fullBase64Image = `data:${mimeType};base64,${base64Data}`;
      } catch (fetchErr: any) {
        console.error("Failed to fetch imageUrl:", fetchErr);
        return res.status(400).json({ error: `Failed to fetch image URL: ${fetchErr.message}` });
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
              text: "Detect the bounding box of the car license plate (including the frame, text, numbers, and any recognizable plate structure) in this image. Return the bounding box in [ymin, xmin, ymax, xmax] format normalized from 0 to 1000. If there are multiple, return the most prominent one. If there is no license plate, return []. IMPORTANT: Your output must be ONLY a valid JSON array of 4 integers."
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
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to detect license plate" });
  }
}
