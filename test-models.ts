import { GoogleGenAI } from "@google/genai";

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{text: "Hello"}] }]
    });
    console.log("Success 2.5: ", response.text);
}
run();
