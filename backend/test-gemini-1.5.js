import "dotenv/config";
import axios from "axios";

const apiKey = process.env.GEMINI_API_KEY;

// Simulate the exact same callGemini logic from travel.js
const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
let lastError;
let allQuotaExhausted = true;

for (const model of models) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const { data } = await axios.post(url, {
            systemInstruction: { parts: [{ text: "Respond ONLY with valid JSON. No markdown fences." }] },
            contents: [{ role: "user", parts: [{ text: 'Return {"days":[{"date":"2026-03-03","label":"Day 1","activities":[{"title":"Explore","description":"Walk around","category":"culture","cost":10,"currency":"USD","timeOfDay":"morning"}]}],"summary":{"estimatedTotal":10,"currency":"USD"}}' }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
        }, { headers: { "Content-Type": "application/json" } });

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanText = text.replace(/```json\s*|```\s*/g, "").trim();
        const parsed = JSON.parse(cleanText);
        console.log(`\n✅ SUCCESS with model: ${model}`);
        console.log("Parsed JSON days:", parsed.days?.length, "days");
        process.exit(0);
    } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message?.split("\n")[0] || err.message;
        if (status === 429) {
            console.log(`⏭ ${model}: 429 quota exhausted, trying next...`);
            continue;
        }
        if ([500, 503].includes(status)) {
            allQuotaExhausted = false;
            console.log(`⏭ ${model}: ${status} server error, trying next...`);
            continue;
        }
        allQuotaExhausted = false;
        console.log(`❌ ${model}: ${status} fatal — ${msg}`);
        break;
    }
}

if (lastError?._quotaExhausted ?? allQuotaExhausted) {
    console.log("\n❌ All models quota exhausted. Would return HTTP 429 to frontend.");
} else {
    console.log("\n❌ Service error. Would return HTTP 503 to frontend.");
}
