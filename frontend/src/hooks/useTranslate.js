import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client.js";

export function useTranslate(sourceLangDefault = "en", targetLangDefault = "es") {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState(sourceLangDefault);
  const [targetLang, setTargetLang] = useState(targetLangDefault);
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!text.trim()) {
      setTranslated("");
      setError("");
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.post("/translate", {
          text,
          sourceLang,
          targetLang,
        });
        setTranslated(res.data.translatedText);
      } catch (err) {
        setTranslated("");
        setError(err?.response?.data?.error || "Failed to translate text");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [text, sourceLang, targetLang]);

  const onChangeText = useCallback((value) => {
    setText(value);
  }, []);

  const swapLanguages = useCallback(() => {
    const oldSourceLang = sourceLang;
    const oldTargetLang = targetLang;
    const oldText = text;
    const oldTranslated = translated;
    
    setSourceLang(oldTargetLang);
    setTargetLang(oldSourceLang);
    setText(oldTranslated);
    setTranslated(oldText);
  }, [sourceLang, targetLang, text, translated]);

  return {
    text,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    translated,
    error,
    loading,
    onChangeText,
    swapLanguages,
  };
}

