import express from "express";
import Joi from "joi";
import axios from "axios";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const translateSchema = Joi.object({
  text: Joi.string().min(1).required(),
  sourceLang: Joi.string().optional().default("en"),
  targetLang: Joi.string().min(2).max(5).required(),
});

// Language codes for Lingva (same as Google Translate codes)
const langCodes = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  ja: "ja",
  it: "it",
  pt: "pt",
  ru: "ru",
  zh: "zh",
  ko: "ko",
  ar: "ar",
  hi: "hi",
  nl: "nl",
  pl: "pl",
  tr: "tr",
  vi: "vi",
  th: "th",
  sv: "sv",
  da: "da",
  fi: "fi",
  no: "no",
  cs: "cs",
  el: "el",
  he: "he",
  id: "id",
  ms: "ms",
  ta: "ta",
  te: "te",
  bn: "bn",
};

// Lingva Translate public instances (free Google Translate proxy)
const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://translate.plausibility.cloud",
  "https://lingva.garuber.dev",
];

async function translateWithLingva(text, sourceLang, targetLang) {
  const source = langCodes[sourceLang] || sourceLang;
  const target = langCodes[targetLang] || targetLang;
  const encodedText = encodeURIComponent(text);

  let lastError;
  for (const instance of LINGVA_INSTANCES) {
    try {
      const url = `${instance}/api/v1/${source}/${target}/${encodedText}`;
      const { data } = await axios.get(url, { timeout: 8000 });
      
      if (data?.translation) {
        return data.translation;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Lingva instance ${instance} failed:`, err.message);
      continue;
    }
  }

  throw lastError || new Error("All translation instances failed");
}

router.post("/", requireAuth, async (req, res) => {
  const { value, error } = translateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const translated = await translateWithLingva(
      value.text,
      value.sourceLang,
      value.targetLang
    );

    res.json({
      text: value.text,
      translatedText: translated,
      targetLang: value.targetLang,
      source: "Lingva",
    });
  } catch (err) {
    console.error("Translation error:", err.message);
    res.status(500).json({ error: "Failed to translate text" });
  }
});

export default router;

