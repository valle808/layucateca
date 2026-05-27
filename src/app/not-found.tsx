"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  // Silent telemetry log on mount
  useEffect(() => {
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ERROR",
        event: "404_page_not_found",
        status: "FAILED",
        path: typeof window !== "undefined" ? window.location.pathname : "/404",
        details: { referrer: typeof document !== "undefined" ? document.referrer : "" },
      }),
    }).catch((err) => console.error("Telemetry failed inside 404:", err));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "10%",
        width: "350px",
        height: "350px",
        background: "rgba(255, 85, 0, 0.06)",
        borderRadius: "50%",
        filter: "blur(100px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "20%",
        right: "10%",
        width: "350px",
        height: "350px",
        background: "rgba(255, 85, 0, 0.03)",
        borderRadius: "50%",
        filter: "blur(100px)",
        pointerEvents: "none",
      }} />

      {/* Main Glass Card */}
      <div style={{
        maxWidth: "440px",
        width: "100%",
        padding: "48px 32px",
        borderRadius: "24px",
        background: "var(--bg-card)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--border-subtle)",
        textAlign: "center",
        position: "relative",
        zIndex: 10,
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* Animated compass icon */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "rgba(255,85,0,0.06)",
            border: "1px solid rgba(255,85,0,0.15)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff5500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="rgba(255,85,0,0.15)" />
            </svg>
          </div>
        </div>

        {/* Error Code */}
        <div style={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: "#ff5500",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}>
          ERROR 404
        </div>

        <h1 style={{
          fontSize: "1.6rem",
          fontWeight: 900,
          letterSpacing: "-0.01em",
          marginBottom: "12px",
          color: "var(--text-primary)",
        }}>
          {t(
            "Pagina no encontrada",
            "Page Not Found",
            "Ma' tu yilaj le paginao'"
          )}
        </h1>

        <p style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          marginBottom: "32px",
          lineHeight: 1.7,
          maxWidth: "320px",
        }}>
          {t(
            "La pagina que buscas no existe o ha sido reubicada. Verifica la direccion o regresa al inicio.",
            "The page you are looking for does not exist or has been moved. Check the URL or return to the homepage.",
            "Le pagina a kaxtiko' ma' yaan wa ts'o'ok u sutpajal. Chek le URL wa sutnaj ti' le yaax pagina."
          )}
        </p>

        {/* Action Buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/" className="btn-primary" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            padding: "14px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {t("Regresar al Inicio", "Return Home", "Sutnaj ti' Yaax")}
          </Link>

          <Link href="/news" className="btn-secondary" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            padding: "14px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {t("Explorar Noticias", "Explore News", "Xook Peektsil")}
          </Link>
        </div>

        {/* Telemetry note */}
        <div style={{
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "0.6rem",
          color: "var(--text-secondary)",
          fontFamily: "monospace",
          opacity: 0.5,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          justifyContent: "center",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff5500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {t(
            "Esta anomalia ha sido reportada a telemetria.",
            "This anomaly has been reported to telemetry.",
            "Le anomaliao' ts'o'ok u ts'iibta'al ti' telemetria."
          )}
        </div>
      </div>
    </div>
  );
}
