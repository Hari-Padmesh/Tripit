import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    localStorage.setItem("beyondly-theme", "light");
  }, []);

  const toggleTheme = () => {
    // Theme toggle disabled - app is light theme only
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

