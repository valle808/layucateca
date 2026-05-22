"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
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
          digest: error?.digest || ""
        },
      }),
    }).catch((err) => console.error("Telemetry failed inside 500 error:", err));
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-[#ff5500]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-center relative z-10 shadow-2xl flex flex-col items-center">
        
        {/* Animated warning icon with glowing red backdrop */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/35 blur-xl rounded-full scale-125 animate-pulse" />
          <div className="w-20 h-20 bg-white/5 border border-red-500/20 rounded-full flex items-center justify-center relative shadow-inner">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Error Code */}
        <div className="font-mono text-xs font-bold tracking-widest text-red-400 uppercase mb-2">
          CRITICAL ERROR: SYSTEM_ANOMALY (500)
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-3">Colisión en la Infraestructura</h1>
        
        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Nuestros sistemas automatizados han detectado una interrupción crítica al sincronizar la base de datos o renderizar esta sección del ecosistema digital.
        </p>

        {error?.digest && (
          <div className="w-full p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-white/40 mb-8 truncate text-center">
            Crash Digest: {error.digest}
          </div>
        )}

        {/* Dynamic Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={() => reset()}
            className="btn-primary w-full py-3 flex justify-center items-center gap-2 bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
          >
            <RefreshCw className="w-4 h-4 text-red-400" />
            Reintentar Operación
          </button>
          
          <Link href="/" className="btn-secondary w-full py-3 flex justify-center items-center gap-2">
            <Home className="w-4 h-4" />
            Regresar al Dashboard
          </Link>
        </div>

        {/* Observability warning */}
        <div className="mt-8 pt-6 border-t border-white/5 text-[10px] text-white/30 font-mono flex items-center gap-1.5 justify-center">
          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          El log de la traza ha sido registrado y despachado para auditoría.
        </div>
      </div>
    </div>
  );
}
