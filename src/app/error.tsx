"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const { t } = useLanguage();

  // Silent telemetry log on server-side or database-level errors
  useEffect(() => {
    console.error("Global crash intercepted:", error);

    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ERROR",
        event: "500_system_crash",
        status: "FAILED",
        path: typeof window !== "undefined" ? window.location.pathname : "/500",
        details: {
          message: error?.message || "Unknown error",
          stack: error?.stack || "",
          digest: error?.digest || "",
        },
      }),
    }).catch((err) => console.error("Telemetry failed inside 500 error:", err));
  }, [error]);

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
        right: "10%",
        width: "350px",
        height: "350px",
        background: "rgba(220, 50, 50, 0.05)",
        borderRadius: "50%",
        filter: "blur(100px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "10%",
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
        {/* Warning icon */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "rgba(220, 50, 50, 0.06)",
            border: "1px solid rgba(220, 50, 50, 0.15)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#dc3232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Error Code */}
        <div style={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: "#dc3232",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}>
          {t("ERROR CRITICO: 500", "CRITICAL ERROR: 500", "TALAMIL NOJOCH: 500")}
        </div>

        <h1 style={{
          fontSize: "1.6rem",
          fontWeight: 900,
          letterSpacing: "-0.01em",
          marginBottom: "12px",
          color: "var(--text-primary)",
        }}>
          {t(
            "Error en la Infraestructura",
            "Infrastructure Error",
            "Talamil ti' le Infraestructura"
          )}
        </h1>

        <p style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          marginBottom: "24px",
          lineHeight: 1.7,
          maxWidth: "320px",
        }}>
          {t(
            "Nuestros sistemas han detectado una interrupcion critica. El equipo ha sido notificado automaticamente.",
            "Our systems have detected a critical interruption. The team has been automatically notified.",
            "K le sistema'ob ku yiliko'ob jump'eel talamil nojoch. Le equipo ts'o'ok u ya'ala'al ti'."
          )}
        </p>

        {error?.digest && (
          <div style={{
            width: "100%",
            padding: "12px",
            background: "rgba(0,0,0,0.2)",
            borderRadius: "12px",
            border: "1px solid var(--border-subtle)",
            fontFamily: "monospace",
            fontSize: "0.6rem",
            color: "var(--text-secondary)",
            marginBottom: "24px",
            textAlign: "center",
            wordBreak: "break-all",
          }}>
            Crash Digest: {error.digest}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => reset()}
            className="btn-primary"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              padding: "14px",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {t("Reintentar Operacion", "Retry Operation", "Sutnaj meyaj")}
          </button>

          <Link href="/" className="btn-secondary" style={{
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
        </div>

        {/* Observability warning */}
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc3232" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {t(
            "El log de la traza ha sido registrado para auditoria.",
            "The trace log has been recorded for auditing.",
            "Le log traza ts'o'ok u ts'iibta'al ti' auditoria."
          )}
        </div>
      </div>
    </div>
  );
}
