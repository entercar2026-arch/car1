import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // Let's create a dummy image or fetch one
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: "Hello"}] }]
    });
    console.log(response.text);
}
run();
