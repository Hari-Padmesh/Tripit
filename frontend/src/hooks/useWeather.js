import { useCallback, useState } from "react";
import { apiClient } from "../api/client.js";

export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherAndFood = useCallback(async ({ lat, lon, locality }) => {
    try {
      setLoading(true);
      const res = await apiClient.post("/travel/weather-food", {
        lat,
        lon,
        locality,
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchWeatherAndFood };
}

