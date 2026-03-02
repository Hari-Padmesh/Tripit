import { useCallback, useState } from "react";
import { apiClient } from "../api/client.js";

export function useFxRates() {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRate = useCallback(async ({ base, target }) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/travel/fx-rates", {
        params: { base, target },
      });
      setRate(res.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rate, loading, error, fetchRate };
}

