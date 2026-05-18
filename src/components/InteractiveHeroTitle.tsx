"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function InteractiveHeroTitle() {
  const { t } = useLanguage();
  const textPart1 = t("Diseña el ", "Design the ", "Pat u ");
  const textPart2 = t("Futuro", "Future", "K'iin");

  return (
    <h1
      style={{
        fontSize: "clamp(2.8rem, 8vw, 6.2rem)",
        fontWeight: 900,
        lineHeight: 1.05,
        marginBottom: "24px",
        letterSpacing: "-0.02em",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex" }}>
        {textPart1.split("").map((char, idx) => (
          <span
            key={"p1-" + idx}
            style={{
              display: "inline-block",
              transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s",
              cursor: "default",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-12px) scale(1.15)";
              e.currentTarget.style.color = "var(--accent-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
      <div className="gradient-text" style={{ display: "flex" }}>
        {textPart2.split("").map((char, idx) => (
          <span
            key={"p2-" + idx}
            style={{
              display: "inline-block",
              transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), text-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-12px) scale(1.2)";
              e.currentTarget.style.textShadow = "0 0 25px var(--accent-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.textShadow = "none";
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </h1>
  );
}
