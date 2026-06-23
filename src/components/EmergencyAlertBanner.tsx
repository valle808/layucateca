"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, Cloud, Sun, CloudRain, CloudLightning, Thermometer, Wind, X, MapPin } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

// ─── Open-Meteo WMO weather interpretation ────────────────────────────────────
// https://open-meteo.com/en/docs — 100% free, no API key needed
function interpretWeather(code: number, temp: number, windspeed: number, t: (es: string, en: string, my: string) => string): {
  title: string;
  message: string;
  level: "INFO" | "WARNING" | "DANGER";
  icon: "sun" | "cloud" | "rain" | "storm" | "heat";
} {
  // Extreme heat regardless of sky
  if (temp >= 40) return {
    level: "DANGER",
    icon: "heat",
    title: t("⚠️ ALERTA DE CALOR EXTREMO", "⚠️ EXTREME HEAT ALERT", "⚠️ K'A'AK' CHAK CHIK'IN"),
    message: t(`Temperatura de ${temp}°C registrada. Riesgo de golpe de calor. Evite exposición solar entre 11 AM y 4 PM. Hidratación constante.`, `Temperature of ${temp}°C recorded. Risk of heat stroke. Avoid sun exposure between 11 AM and 4 PM. Stay hydrated.`, `Chokwil de ${temp}°C. Ma' a p'áatal ti' k'iin. Uk'e' ya'ab ha'.`),
  };
  if (temp >= 36) return {
    level: "WARNING",
    icon: "heat",
    title: t("⚠️ AVISO METEOROLÓGICO: ONDA DE CALOR", "⚠️ WEATHER ADVISORY: HEAT WAVE", "⚠️ PÉEKTSIL: CHOKO K'IIN"),
    message: t(`Se registran ${temp}°C con sensación térmica elevada. Se recomienda mantenerse en interiores ventilados y consumir abundante agua.`, `${temp}°C recorded with high heat index. Stay in ventilated indoors and drink plenty of water.`, `${temp}°C. P'áaten ichil a najil yéetel uk' ya'ab ha'.`),
  };

  // Storm / thunderstorm codes 95-99
  if (code >= 95) return {
    level: "DANGER",
    icon: "storm",
    title: t("⛈️ ALERTA: TORMENTA ELÉCTRICA ACTIVA", "⛈️ ALERT: ACTIVE THUNDERSTORM", "⛈️ PÉEKTSIL: CHAAK YÉETEL K'ÁAK'"),
    message: t(`Tormenta eléctrica en curso. Vientos de ${windspeed} km/h. Evite zonas abiertas, árboles y estructuras metálicas hasta nuevo aviso.`, `Thunderstorm in progress. Winds of ${windspeed} km/h. Avoid open areas, trees, and metal structures.`, `Táan u k'áaxal chaak. Iik' de ${windspeed} km/h. Ma' a p'áatal tu táan che'ob.`),
  };
  // Heavy rain 55, 65, 75, 85
  if ([55, 65, 75, 85, 82].includes(code) || (code >= 80 && code <= 82)) return {
    level: "WARNING",
    icon: "rain",
    title: t("🌧️ AVISO DE LLUVIA INTENSA", "🌧️ HEAVY RAIN ADVISORY", "🌧️ PÉEKTSIL: K'A'AM CHAAK"),
    message: t(`Lluvia intensa con acumulación significativa. Precaución en vialidades y zonas bajas. Vientos de ${windspeed} km/h.`, `Heavy rain with significant accumulation. Caution on roads and low areas. Winds of ${windspeed} km/h.`, `K'a'am u k'áaxal ha'. Kanáantaba tu noj bej. Iik' de ${windspeed} km/h.`),
  };
  // Moderate rain 51-67
  if (code >= 51 && code <= 67) return {
    level: "INFO",
    icon: "rain",
    title: t("🌦️ AVISO METEOROLÓGICO: LLUVIA MODERADA", "🌦️ WEATHER ADVISORY: MODERATE RAIN", "🌦️ PÉEKTSIL: CHAAK"),
    message: t(`Se esperan lluvias moderadas durante las próximas horas. Temperatura actual: ${temp}°C. Lleve paraguas.`, `Moderate rains expected in the coming hours. Current temp: ${temp}°C. Carry an umbrella.`, `Bíin k'áaxak ha'. Chokwil: ${temp}°C. Ch'a'a a pixan.`),
  };
  // High winds
  if (windspeed >= 50) return {
    level: "WARNING",
    icon: "cloud",
    title: t("💨 ALERTA DE VIENTOS FUERTES", "💨 HIGH WIND ALERT", "💨 PÉEKTSIL: K'A'AM IIK'"),
    message: t(`Vientos de ${windspeed} km/h registrados. Asegure objetos sueltos en exteriores. Precaución al conducir vehículos de carga.`, `Winds of ${windspeed} km/h recorded. Secure loose outdoor objects. Caution when driving.`, `Iik' de ${windspeed} km/h. Kanáantaba yéetel ba'alo'ob ku yáalkab.`),
  };
  // Cloudy with normal temps
  if (code >= 2 && code <= 48) return {
    level: "INFO",
    icon: "cloud",
    title: t("⛅ CONDICIÓN METEOROLÓGICA", "⛅ WEATHER CONDITION", "⛅ BIX YANIL K'IIN"),
    message: t(`Cielo parcialmente nublado. Temperatura: ${temp}°C. Vientos: ${windspeed} km/h. Condiciones generales favorables.`, `Partly cloudy skies. Temp: ${temp}°C. Winds: ${windspeed} km/h. Favorable conditions.`, `Nukuch múuyal. Chokwil: ${temp}°C. Iik': ${windspeed} km/h. Ma'alob k'iin.`),
  };
  // Clear and warm
  return {
    level: "INFO",
    icon: "sun",
    title: t("☀️ CONDICIÓN METEOROLÓGICA", "☀️ WEATHER CONDITION", "☀️ BIX YANIL K'IIN"),
    message: t(`Cielo despejado. Temperatura: ${temp}°C. Índice UV elevado — use protector solar al aire libre.`, `Clear skies. Temp: ${temp}°C. High UV index — use sunscreen outdoors.`, `Sáasil k'iin. Chokwil: ${temp}°C. K'a'am u k'iinil — kanáantaba.`),
  };
}

const ICON_MAP = {
  sun:   <Sun className="w-5 h-5 shrink-0" />,
  cloud: <Cloud className="w-5 h-5 shrink-0" />,
  rain:  <CloudRain className="w-5 h-5 shrink-0" />,
  storm: <CloudLightning className="w-5 h-5 shrink-0 animate-pulse" />,
  heat:  <Thermometer className="w-5 h-5 shrink-0 animate-pulse" />,
};

const LEVEL_COLORS = {
  INFO:    "linear-gradient(90deg, #1a5276, #2980b9)",
  WARNING: "linear-gradient(90deg, #b7770d, #e67e22)",
  DANGER:  "linear-gradient(90deg, #b83227, #e17055)",
};

interface WeatherData {
  title: string;
  message: string;
  level: "INFO" | "WARNING" | "DANGER";
  icon: "sun" | "cloud" | "rain" | "storm" | "heat";
  city?: string;
  lastUpdated?: Date;
}

// Reverse geocode with Open-Meteo's recommended approach: nominatim
async function getCityName(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`,
      { headers: { "User-Agent": "LaYucateca/1.0 weather@layucateca.com" } }
    );
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      data.address?.state ||
      "Tu ubicación"
    );
  } catch {
    return "Tu ubicación";
  }
}

export default function EmergencyAlertBanner() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const fetchWeather = useCallback(async () => {
    try {
      // 1. Try Geolocation first
      let lat: number, lon: number;
      try {
        const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("no-geo"));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            () => reject(new Error("denied")),
            { timeout: 8000, maximumAge: 300000 }
          );
        });
        lat = coords.latitude;
        lon = coords.longitude;
      } catch (e) {
        // Fallback to IP geolocation
        const ipRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const ipData = await ipRes.json();
        lat = parseFloat(ipData.latitude);
        lon = parseFloat(ipData.longitude);
      }

      // 2. Fetch weather from Open-Meteo (free, no key)
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weathercode,windspeed_10m` +
        `&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto`;

      const [weatherRes, city] = await Promise.all([
        fetch(weatherUrl, { signal: AbortSignal.timeout(8000) }),
        getCityName(lat, lon),
      ]);

      if (!weatherRes.ok) throw new Error("weather-api-failed");
      const data = await weatherRes.json();

      const temp = Math.round(data.current?.temperature_2m ?? 30);
      const code = data.current?.weathercode ?? 0;
      const wind = Math.round(data.current?.windspeed_10m ?? 0);

      const interpreted = interpretWeather(code, temp, wind, t);
      setWeather({ ...interpreted, city, lastUpdated: new Date() });
    } catch (err: any) {
      // Geolocation denied or unavailable — fall back to Yucatán defaults from DB
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data = await res.json();
          const alert = data.alerts?.[0];
          if (alert) {
            setWeather({
              title: alert.title,
              message: alert.message,
              level: alert.level === "DANGER" ? "DANGER" : alert.level === "WARNING" ? "WARNING" : "INFO",
              icon: "heat",
              city: alert.location || "Yucatán",
              lastUpdated: new Date(),
            });
          }
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWeather();
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!loading && weather && !closed) {
      document.documentElement.style.setProperty("--banner-height", "42px");
      timer = setTimeout(() => {
        setClosed(true);
      }, 5000);
    } else {
      document.documentElement.style.setProperty("--banner-height", "0px");
    }
    return () => clearTimeout(timer);
  }, [loading, weather, closed]);

  if (loading || !weather || closed) return null;

  const bg = LEVEL_COLORS[weather.level];
  const icon = ICON_MAP[weather.icon];
  const updatedStr = weather.lastUpdated
    ? weather.lastUpdated.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      style={{
        background: bg,
        color: "#ffffff",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        minHeight: "42px",
      }}
      className="animate-fadeInUp"
    >
      {/* Left: icon + text */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1, minWidth: 0 }}>
        {icon}
        <div style={{ fontSize: "0.72rem", fontFamily: "monospace", lineHeight: 1.4, overflow: "hidden" }}>
          <strong style={{ fontWeight: 800, marginRight: "6px" }}>{weather.title}</strong>
          <span style={{ opacity: 0.95 }}>{weather.message}</span>
        </div>
      </div>

      {/* Right: location + time + close */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {weather.city && (
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "0.65rem", opacity: 0.8, whiteSpace: "nowrap",
          }}>
            <MapPin className="w-3 h-3" />
            {weather.city}
            {updatedStr && <span style={{ opacity: 0.7 }}> · {updatedStr}</span>}
          </div>
        )}
        <button
          onClick={() => {
            setClosed(true);
            document.documentElement.style.setProperty("--banner-height", "0px");
          }}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "4px",
            color: "#ffffff",
            cursor: "pointer",
            padding: "4px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={t("Cerrar aviso", "Close advisory", "K'áal péektsil")}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
