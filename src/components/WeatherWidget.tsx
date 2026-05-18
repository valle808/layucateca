"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

interface WeatherWidgetProps {
  stateName: string;
}

export default function WeatherWidget({ stateName }: WeatherWidgetProps) {
  const { t } = useLanguage();

  // Dynamic realistic weather mockup based on Mexican state
  const getWeatherInfo = (state: string) => {
    switch (state) {
      case "Yucatán":
        return {
          temp: "34°C",
          desc: t("Soleado y Húmedo", "Sunny & Humid"),
          icon: "☀️",
          humidity: "76%",
          wind: "14 km/h",
        };
      case "Campeche":
        return {
          temp: "33°C",
          desc: t("Parcialmente Nublado", "Partly Cloudy"),
          icon: "⛅",
          humidity: "80%",
          wind: "12 km/h",
        };
      case "Quintana Roo":
        return {
          temp: "31°C",
          desc: t("Tormentas Aisladas", "Isolated Storms"),
          icon: "⛈️",
          humidity: "86%",
          wind: "18 km/h",
        };
      case "CDMX":
        return {
          temp: "22°C",
          desc: t("Agradable y Templado", "Pleasant & Mild"),
          icon: "☁️",
          humidity: "42%",
          wind: "8 km/h",
        };
      case "Jalisco":
        return {
          temp: "27°C",
          desc: t("Despejado", "Clear Skies"),
          icon: "☀️",
          humidity: "38%",
          wind: "10 km/h",
        };
      case "Nuevo León":
        return {
          temp: "37°C",
          desc: t("Extremadamente Caluroso", "Extremely Hot"),
          icon: "🔥",
          humidity: "28%",
          wind: "16 km/h",
        };
      default:
        return {
          temp: "30°C",
          desc: t("Variado", "Mixed Weather"),
          icon: "⛅",
          humidity: "65%",
          wind: "12 km/h",
        };
    }
  };

  const weather = getWeatherInfo(stateName);

  return (
    <div
      className="card"
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: "radial-gradient(ellipse at 100% 0%, rgba(212,168,83,0.08) 0%, transparent 70%), var(--bg-card)",
        border: "1px solid var(--border-accent)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <p className="section-label" style={{ marginBottom: "12px" }}>
        {t("Clima Local", "Local Weather")}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
            {stateName}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "2px 0 0" }}>
            {weather.desc}
          </p>
        </div>
        <span style={{ fontSize: "3rem", lineHeight: 1 }}>{weather.icon}</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "20px" }}>
        <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)" }}>
          {weather.temp}
        </span>
      </div>

      <div className="divider" style={{ margin: "12px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
            {t("Humedad", "Humidity")}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, margin: "2px 0 0" }}>
            {weather.humidity}
          </p>
        </div>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
            {t("Viento", "Wind")}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, margin: "2px 0 0" }}>
            {weather.wind}
          </p>
        </div>
      </div>
    </div>
  );
}
