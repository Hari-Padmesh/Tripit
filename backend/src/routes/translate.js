import express from "express";
import Joi from "joi";
import axios from "axios";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const translateSchema = Joi.object({
  text: Joi.string().min(1).required(),
  sourceLang: Joi.string().optional().default("auto"),
  targetLang: Joi.string().min(2).max(5).required(),
});

router.post("/", requireAuth, async (req, res) => {
  const { value, error } = translateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const apiKey = process.env.TRANSLATE_API_KEY;
    const url = "https://translation.googleapis.com/language/translate/v2";
    const { data } = await axios.post(
      `${url}?key=${apiKey}`,
      {
        q: value.text,
        target: value.targetLang,
        source: value.sourceLang === "auto" ? undefined : value.sourceLang,
        format: "text",
      },
      { headers: { "Content-Type": "application/json" } },
    );

    const translated =
      data?.data?.translations?.[0]?.translatedText || value.text;

    res.json({
      text: value.text,
      translatedText: translated,
      targetLang: value.targetLang,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to translate text" });
  }
});

export default router;

