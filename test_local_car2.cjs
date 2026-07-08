const { GoogleGenAI, Type } = require("@google/genai");
const fs = require("fs");

async function testModel(ai, modelName, base64Data) {
  console.log(`\n--- Testing ${modelName} on car2.jpg ---`);
  try {
    const response = await ai.models.generateContent({
      model: modelName,
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
              text: "You are an expert vehicle registration plate detector. Your job is to locate the exact bounding box of the license plate on the car shown in the image.\n\n" +
                    "Look extremely closely for the following types of license plates:\n" +
                    "1. Cambodian (Khmer) plates (highly common): These are horizontal rectangular plates with a white background and a thin red border. They contain Khmer text at the top (e.g., 'ភ្នំពេញ' or other province names) and blue/black alphanumeric text at the bottom (e.g., '2CK-2010', '2CH-5590', '2CA-0980').\n" +
                    "2. Standard rectangular plates: Any white, yellow, blue, black, or colored license plate on the front bumper/grille or rear trunk/tailgate/bumper.\n\n" +
                    "License plates on hatchbacks (like a Toyota Prius), SUVs, or vans are often located higher up on the rear trunk/tailgate (directly under the brand logo or between the tail lights), rather than low down on the bumper. Look there carefully.\n\n" +
                    "Even if the license plate is tilted, angled, or shot from a three-quarters perspective, find its exact boundaries.\n\n" +
                    "Output requirements:\n" +
                    "- Find the EXACT boundaries of the license plate.\n" +
                    "- Return ONLY a JSON array of 4 integers: [ymin, xmin, ymax, xmax] normalized from 0 to 1000 (0 is top/left, 1000 is bottom/right).\n" +
                    "- Return [] if there is absolutely no car or no license plate visible in the image."
            }
          ]
        }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
              type: Type.INTEGER
          },
          description: "A JSON array of exactly 4 integers [ymin, xmin, ymax, xmax] normalized from 0 to 1000 representing the bounding box of the license plate."
        }
      }
    });
    console.log(`Success! Response:`, response.text);
    return true;
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message || err);
    return false;
  }
}

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const filename = "car2.jpg";
  if (!fs.existsSync(filename)) {
    console.log("car2.jpg does not exist");
    return;
  }
  const buffer = fs.readFileSync(filename);
  const base64Data = buffer.toString('base64');

  const models = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.1-pro-preview"
  ];

  for (const m of models) {
    await testModel(ai, m, base64Data);
  }
}

run();
