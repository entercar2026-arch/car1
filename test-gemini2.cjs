require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/1/1b/1993_Ford_Mustang_LX_5.0_convertible_rear.jpg";
  const imageRes = await fetch(imageUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
  const arrayBuffer = await imageRes.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          { text: "What is in this image?" }
        ]
      }
    ]
  });
  console.log("Response:", response.text);
}
test().catch(console.error);
