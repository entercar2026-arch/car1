import { GoogleGenAI } from "@google/genai";

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{text: "Detect the bounding box of the car license plate. Return [0, 0, 100, 100]"}] }]
    });
    console.log("Success Bbox: ", response.text);
}
run();
