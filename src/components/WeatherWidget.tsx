"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Sun, Cloud, CloudRain, CloudLightning, Thermometer } from "lucide-react";

interface WeatherWidgetProps {
  stateName: string;
}

const STATE_COORDS: Record<string, { lat: number; lon: number }> = {
  "Yucatán": { lat: 20.9674, lon: -89.6243 }, // Mérida
  "Campeche": { lat: 19.8301, lon: -90.5349 }, // Campeche
  "Quintana Roo": { lat: 21.1619, lon: -86.8515 }, // Cancún
  "CDMX": { lat: 19.4326, lon: -99.1332 }, // CDMX
  "Jalisco": { lat: 20.6597, lon: -103.3496 }, // Guadalajara
  "Nuevo León": { lat: 25.6866, lon: -100.3161 }, // Monterrey
};

function interpretWeatherCode(code: number, t: any) {
  if (code >= 95) return { desc: t("Tormenta", "Storm", "Chaak"), icon: <CloudLightning className="w-12 h-12" /> };
  if ([55, 65, 75, 85, 82].includes(code) || (code >= 80 && code <= 82)) return { desc: t("Lluvia Fuerte", "Heavy Rain", "K'a'am Ha'"), icon: <CloudRain className="w-12 h-12" /> };
  if (code >= 51 && code <= 67) return { desc: t("Lluvia Ligera", "Light Rain", "Chéen Ha'"), icon: <CloudRain className="w-12 h-12" /> };
  if (code >= 2 && code <= 48) return { desc: t("Nublado", "Cloudy", "Múuyal"), icon: <Cloud className="w-12 h-12" /> };
  return { desc: t("Despejado", "Clear Skies", "Sáasil"), icon: <Sun className="w-12 h-12" /> };
}

export default function WeatherWidget({ stateName }: WeatherWidgetProps) {
  const { t } = useLanguage();
  const [weather, setWeather] = useState({
    temp: "--",
    humidity: "--",
    wind: "--",
    desc: t("Cargando...", "Loading..."),
    icon: <Sun className="w-12 h-12" />
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        let lat = 20.9674;
        let lon = -89.6243; // Default to Mérida
        
        if (STATE_COORDS[stateName]) {
          lat = STATE_COORDS[stateName].lat;
          lon = STATE_COORDS[stateName].lon;
        }

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();
        
        const current = data.current;
        const interpretation = interpretWeatherCode(current.weather_code, t);

        setWeather({
          temp: `${Math.round(current.temperature_2m)}°C`,
          humidity: `${current.relative_humidity_2m}%`,
          wind: `${Math.round(current.wind_speed_10m)} km/h`,
          desc: interpretation.desc,
          icon: interpretation.icon,
        });
      } catch (err) {
        console.error("Error fetching weather for widget:", err);
      }
    }

    fetchWeather();
  }, [stateName, t]);

  const displayStateName = stateName === "Todos" || stateName === "Internacional" ? "Yucatán" : stateName;

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
        {t("Clima Local", "Local Weather", "Bix Yanil K'iin")}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
            {displayStateName}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "2px 0 0" }}>
            {weather.desc}
          </p>
        </div>
        <div style={{ color: "var(--accent-primary)" }}>
          {weather.icon}
        </div>
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
            {t("Humedad", "Humidity", "Yóok'ol")}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, margin: "2px 0 0" }}>
            {weather.humidity}
          </p>
        </div>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
            {t("Viento", "Wind", "Iik'")}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, margin: "2px 0 0" }}>
            {weather.wind}
          </p>
        </div>
      </div>
    </div>
  );
}
