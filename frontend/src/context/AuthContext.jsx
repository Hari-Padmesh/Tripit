import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("beyondly-auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setAccessToken(parsed.accessToken || null);
        // Ensure axios interceptor has the token
        if (parsed.accessToken) {
          window.sessionStorage.setItem("beyondly-access-token", parsed.accessToken);
        }
        setLoading(false);
        return;
      } catch {
        // ignore parse errors
      }
    }
    // If no accessToken, try to refresh (for Google OAuth or page reload)
    apiClient.post("/auth/refresh")
      .then(async res => {
        if (res.data.accessToken) {
          setAccessToken(res.data.accessToken);
          window.sessionStorage.setItem("beyondly-access-token", res.data.accessToken);
          // Fetch user info after refresh
          try {
            const userRes = await apiClient.get("/auth/me", {
              headers: { Authorization: `Bearer ${res.data.accessToken}` },
            });
            setUser(userRes.data);
            window.sessionStorage.setItem(
              "beyondly-auth",
              JSON.stringify({
                user: userRes.data,
                accessToken: res.data.accessToken,
              })
            );
          } catch {
            setUser(null);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setAccessToken(null);
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
    window.sessionStorage.setItem(
      "beyondly-auth",
      JSON.stringify({
        user: res.data.user,
        accessToken: res.data.accessToken,
      }),
    );
    // Also store accessToken for axios interceptor
    window.sessionStorage.setItem("beyondly-access-token", res.data.accessToken);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await apiClient.post("/auth/signup", { name, email, password });
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
    window.sessionStorage.setItem(
      "beyondly-auth",
      JSON.stringify({
        user: res.data.user,
        accessToken: res.data.accessToken,
      }),
    );
    // Also store accessToken for axios interceptor
    window.sessionStorage.setItem("beyondly-access-token", res.data.accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    }
    setUser(null);
    setAccessToken(null);
    window.sessionStorage.removeItem("beyondly-auth");
    window.sessionStorage.removeItem("beyondly-access-token");
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

