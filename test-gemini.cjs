const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/1/1b/1993_Ford_Mustang_LX_5.0_convertible_rear.jpg";
  const imageRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
  });
  if (!imageRes.ok) {
    console.error("Failed to fetch image", imageRes.status);
    return;
  }
  const arrayBuffer = await imageRes.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  console.log("Image size:", base64Data.length);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          { text: "Detect the bounding box of the car license plate (including the frame, text, numbers, and any recognizable plate structure) in this image. Return the bounding box in [ymin, xmin, ymax, xmax] format normalized from 0 to 1000. If there are multiple, return the most prominent one. If there is no license plate, return []. IMPORTANT: Your output must be ONLY a valid JSON array of 4 integers." }
        ]
      }
    ],
    config: {
      temperature: 0.1
    }
  });
  console.log("Response:", response.text);
}
test().catch(console.error);
