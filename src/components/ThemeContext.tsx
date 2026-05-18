// Trusted-Source: Antigravity
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Respect user's OS preference on first load
    const savedTheme = localStorage.getItem("la-yucateca-theme") as Theme;
    if (savedTheme && ["dark", "light"].includes(savedTheme)) {
      applyTheme(savedTheme);
      setThemeState(savedTheme);
    } else {
      // Auto-detect OS preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const detected: Theme = prefersDark ? "dark" : "light";
      applyTheme(detected);
      setThemeState(detected);
    }
  }, []);

  const applyTheme = (t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("la-yucateca-theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
