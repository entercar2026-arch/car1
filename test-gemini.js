const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
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
  console.log("Raw text:", response.text());
}
run().catch(console.error);
