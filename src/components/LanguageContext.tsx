"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en" | "my"; // es: Spanish, en: English, my: Maya

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (es: string, en: string, my?: string) => string;
  translateDb: (text: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("la-yucateca-lang") as Language;
    if (saved === "es" || saved === "en" || saved === "my") {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("la-yucateca-lang", lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang === "my" ? "yua" : lang;
  };

  const t = (es: string, en: string, my?: string) => {
    if (!mounted) return es; // Default to Spanish during hydration
    if (language === "my") {
      return my || es; // Fallback to Spanish if Mayan translation is not defined
    }
    return language === "en" ? en : es;
  };

  const translateDb = (text: string | null | undefined) => {
    if (!text) return "";
    const parts = text.split(" || ");
    if (parts.length > 1) {
      if (!mounted) return parts[0]; // Default to Spanish during hydration
      if (language === "my") {
        return parts[2] || parts[0]; // Index 2 is Mayan, fallback to Spanish
      }
      return language === "en" ? parts[1] : parts[0];
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateDb }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "es" as Language,
      setLanguage: () => {},
      t: (es: string, en: string, my?: string) => es,
      translateDb: (text: string | null | undefined) => {
        if (!text) return "";
        return text.split(" || ")[0];
      },
    };
  }
  return context;
}
