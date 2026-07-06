import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Fetch a car image and convert to base64
  const imageUrl = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
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
  console.log("Gemini 2.5 response:", response.text);

  const response35 = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
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
  console.log("Gemini 3.5 response:", response35.text);
}
run().catch(console.error);
