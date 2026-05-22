"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Compass, Home, Search, AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
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
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-[#ff5500]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-[#ff5500]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-center relative z-10 shadow-2xl flex flex-col items-center">
        
        {/* Animated Compass Icon with neon glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#ff5500]/30 blur-xl rounded-full scale-125 animate-pulse" />
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative shadow-inner">
            <Compass className="w-10 h-10 text-[#ff5500] animate-spin" style={{ animationDuration: '20s' }} />
          </div>
        </div>

        {/* Error Code */}
        <div className="font-mono text-xs font-bold tracking-widest text-[#ff5500] uppercase mb-2">
          ERROR CODE: 404_PAGE_NOT_FOUND
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-3">¿Te has perdido en Celestún?</h1>
        
        <p className="text-sm text-white/60 mb-8 leading-relaxed">
          Parece que has tomado un desvío incorrecto por la selva o entre los manglares de Yucatán. La página que buscas no existe o ha sido reubicada por nuestro sistema autónomo.
        </p>

        {/* Dynamic Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link href="/" className="btn-primary w-full py-3 flex justify-center items-center gap-2">
            <Home className="w-4 h-4" />
            Regresar al Dashboard
          </Link>
          
          <Link href="/news" className="btn-secondary w-full py-3 flex justify-center items-center gap-2">
            <Search className="w-4 h-4" />
            Explorar Noticias Recientes
          </Link>
        </div>

        {/* Tiny admin tip */}
        <div className="mt-8 pt-6 border-t border-white/5 text-[10px] text-white/30 font-mono flex items-center gap-1.5 justify-center">
          <AlertCircle className="w-3.5 h-3.5 text-[#ff5500]" />
          Esta anomalía ha sido silenciosamente reportada a telemetría.
        </div>
      </div>
    </div>
  );
}
