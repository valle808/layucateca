"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  level: string;
}

export default function EmergencyAlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
        }
      } catch (e) {
        console.error("Failed to load alerts", e);
      }
    };
    fetchAlerts();
  }, []);

  if (closed || alerts.length === 0) return null;

  const activeAlert = alerts[0];

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #b83227, #e17055)",
        color: "#ffffff",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        boxShadow: "0 4px 15px rgba(225, 112, 85, 0.3)",
      }}
      className="animate-fadeInUp"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1 }}>
        <AlertCircle className="w-5 h-5 text-white shrink-0 animate-bounce" />
        <div style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
          <strong style={{ fontWeight: 800 }}>{activeAlert.title}</strong> — {activeAlert.message}
        </div>
      </div>
      <button
        onClick={() => setClosed(true)}
        style={{
          background: "none",
          border: "none",
          color: "#ffffff",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Cerrar aviso"
      >
        <X className="w-4 h-4 hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
