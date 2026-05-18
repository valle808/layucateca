"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";

interface SpeechPlayerProps {
  text: string; // Bilingual/Trilingual separated by " || "
}

export default function SpeechPlayer({ text }: SpeechPlayerProps) {
  const { t, language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Get active text based on current locale
  const getActiveText = () => {
    const parts = text.split(" || ");
    if (parts.length > 1) {
      if (language === "my") {
        return parts[2] || parts[0]; // Return Mayan text, fallback to Spanish
      }
      return language === "en" ? parts[1] : parts[0];
    }
    return text;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Auto-select a voice matching active language
        // Mayan (my) defaults to Spanish (MX) for local acoustic resonance
        const defaultLangCode = language === "my" ? "es" : language === "es" ? "es" : "en";
        const matchingVoice = availableVoices.find(
          (v) => v.lang.startsWith(defaultLangCode)
        );
        if (matchingVoice) {
          setSelectedVoice(matchingVoice.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language]);

  const speak = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    synthRef.current.cancel(); // Stop any active speech

    const textToSpeak = getActiveText();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Apply voice
    if (selectedVoice) {
      const voice = voices.find((v) => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    } else {
      // Fallback language settings
      utterance.lang = language === "my" ? "es-MX" : language === "es" ? "es-MX" : "en-US";
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    synthRef.current.speak(utterance);
  };

  const pause = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-accent)",
        borderRadius: "16px",
        margin: "24px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? pause : speak}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4a853, #b8892a)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(212,168,83,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title={isPlaying ? t("Pausar", "Pause", "Pausar") : t("Escuchar Artículo", "Listen to Article", "U'uybil Péektsil")}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0f">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0f" style={{ marginLeft: "2px" }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Stop Button */}
        {(isPlaying || isPaused) && (
          <button
            onClick={stop}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
            title={t("Detener", "Stop", "Detener")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-primary)">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        )}

        <div>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>
            {isPlaying
              ? t("Reproduciendo audio...", "Playing audio story...", "U'uybil péektsil...")
              : isPaused
              ? t("Audio pausado", "Audio paused", "Audio pausado")
              : t("Escuchar este artículo", "Listen to this article", "U'uybil le péektsila'")}
          </p>
          {/* Custom voice select dropdown */}
          {voices.length > 0 && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "0.72rem",
                cursor: "pointer",
                padding: "2px 0",
                maxWidth: "200px",
                outline: "none",
              }}
            >
              {voices
                .filter((v) => v.lang.startsWith("es") || v.lang.startsWith("en"))
                .map((v) => (
                  <option key={v.name} value={v.name} style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>
                    {v.name} ({v.lang})
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* Interactive Soundwave visualizer */}
      <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "24px" }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              width: "3px",
              height: isPlaying ? "100%" : "20%",
              background: "linear-gradient(to top, #d4a853, #2dd2c0)",
              borderRadius: "2px",
              animation: isPlaying ? `soundwave-bounce 0.8s ease-in-out infinite alternate` : "none",
              animationDelay: `${i * 0.12}s`,
              transition: "height 0.3s ease-out",
            }}
          />
        ))}
      </div>

      {/* Styled animation keyframes */}
      <style jsx global>{`
        @keyframes soundwave-bounce {
          0% {
            height: 20%;
          }
          100% {
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}
