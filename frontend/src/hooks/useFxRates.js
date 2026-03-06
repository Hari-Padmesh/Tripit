import { useCallback, useState } from "react";
import { apiClient } from "../api/client.js";

export function useFxRates() {
  const [rate, setRate] = useState(null);
  const [allRates, setAllRates] = useState(null);
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

  // Fetch all rates for a base currency
  const fetchAllRates = useCallback(async (base) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/travel/fx-rates/all", {
        params: { base },
      });
      setAllRates(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert amount from one currency to another using fetched rates
  const convert = useCallback((amount, fromCurrency, rates) => {
    if (!rates || !rates.rates) return amount;
    const fromRate = rates.rates[fromCurrency];
    if (!fromRate) return amount;
    // rates are relative to the base currency
    // If base is USD and fromCurrency is EUR, rate tells us 1 USD = X EUR
    // To convert EUR to USD: amount / rate
    return amount / fromRate;
  }, []);

  return { rate, allRates, loading, error, fetchRate, fetchAllRates, convert };
}

