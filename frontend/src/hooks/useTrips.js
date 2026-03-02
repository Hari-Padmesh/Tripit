import { useEffect, useState, useCallback } from "react";
import { apiClient } from "../api/client.js";

export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/travel/trips");
      setTrips(res.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlySummary = useCallback(async () => {
    const res = await apiClient.get("/travel/trips/summary-by-month");
    return res.data;
  }, []);

  const createWalletTrip = useCallback(async (payload) => {
    const res = await apiClient.post("/travel/wallets", payload);
    await fetchTrips();
    return res.data;
  }, [fetchTrips]);

  const generateItinerary = useCallback(async (payload) => {
    const res = await apiClient.post("/travel/itinerary", payload);
    await fetchTrips();
    return res.data;
  }, [fetchTrips]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    trips,
    loading,
    error,
    fetchTrips,
    fetchMonthlySummary,
    createWalletTrip,
    generateItinerary,
  };
}

