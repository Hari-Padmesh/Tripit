import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client.js";

export function useTranslate(targetLangDefault = "en") {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState(targetLangDefault);
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setTranslated("");
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await apiClient.post("/translate", {
          text,
          targetLang,
        });
        setTranslated(res.data.translatedText);
      } catch {
        setTranslated("");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [text, targetLang]);

  const onChangeText = useCallback((value) => {
    setText(value);
  }, []);

  return {
    text,
    targetLang,
    setTargetLang,
    translated,
    loading,
    onChangeText,
  };
}

