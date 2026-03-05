import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key loaded:", apiKey ? "Yes" : "No");

async function testSDK() {
  const ai = new GoogleGenAI({ apiKey });
  
  const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"];
  
  for (const model of models) {
    try {
      console.log(`\nTrying model: ${model}...`);
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          "Respond ONLY with valid JSON. No markdown.",
          "Return {\"test\": \"hello\"}"
        ],
        config: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      });

      console.log("Response text:", response?.text);
      console.log("✅ SUCCESS");
      break;
    } catch (err) {
      console.log(`❌ Failed:`, err.message);
      const status = err?.status || err?.response?.status;
      if ([429, 500, 503].includes(status)) {
        console.log("Retrying next model...");
        continue;
      }
    }
  }
}

testSDK();
