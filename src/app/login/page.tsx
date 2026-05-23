"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  Globe, 
  ArrowRight 
} from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const { login, register, user } = useAuth();
  const router = useRouter();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (user) {
    // Redirect if already logged in
    setTimeout(() => {
      router.push("/");
    }, 1200);

    return (
      <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-[var(--bg-primary)] transition-colors duration-300 relative overflow-hidden">
        {/* Soft Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(255,85,0,0.03)] blur-[100px] pointer-events-none" />
        
        <div className="p-12 max-w-md w-full text-center border border-[var(--border-accent)] bg-[var(--bg-card)] rounded-[32px] animate-fadeInUp shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[var(--glow-gold)] backdrop-blur-xl relative z-10">
          <div className="w-20 h-20 rounded-full bg-[rgba(255,85,0,0.08)] flex items-center justify-center border border-[rgba(255,85,0,0.2)] mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-[#ff5500]" />
          </div>
          <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-wide">
            {t("Sesión Activa", "Active Session", "Tsolob Kuxtal")}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed font-medium">
            {t(`Hola ${user.name}, redirigiéndote al inicio...`, `Hello ${user.name}, redirecting to home...`, `Ki'ola ${user.name}, sutnaj to'on ti' yáax...`)}
          </p>
        </div>
      </main>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLoginTab) {
        const res = await login({ email: formData.email, password: formData.password });
        if (res.success) {
          router.push("/");
        } else {
          setErrorMsg(res.error || t("Error de inicio de sesión.", "Sign-in error.", "Talamil okol."));
        }
      } else {
        const res = await register(formData);
        if (res.success) {
          setSuccessMsg(t("¡Registro exitoso! Iniciando sesión...", "Registration successful! Signing in...", "¡Jats'uts ts'íib! Okol bejla'e'..."));
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          setErrorMsg(res.error || t("Error al registrarse.", "Registration error.", "Talamil ts'íib."));
        }
      }
    } catch (err) {
      setErrorMsg(t("Error de red.", "Network error.", "Talamil k'áax."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center px-4 bg-[var(--bg-primary)] transition-colors duration-300 relative overflow-hidden">
      {/* Exquisite minimal background grid and subtle orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(#ff5500/[0.015]_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none select-none opacity-80" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[rgba(255,85,0,0.02)] dark:bg-[rgba(255,85,0,0.01)] blur-[120px] pointer-events-none" />

      {/* TOP DECORATIVE LABEL: 🌐 UNIFIED UXL INTERFACE */}
      <div className="text-center mb-6 relative z-10 animate-fadeInUp">
        <span className="text-[10px] font-black italic tracking-[0.25em] text-[#ff5500] uppercase flex items-center justify-center gap-2 opacity-95">
          <Globe className="w-3.5 h-3.5" />
          <span>{t("INTERFAZ UXL UNIFICADA", "UNIFIED UXL INTERFACE", "UNIFIED UXL INTERFACE")}</span>
        </span>
      </div>

      {/* STUNNING NEXUS CARD CONTAINER */}
      <div className="w-full max-w-xl p-8 md:p-14 rounded-[48px] border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.75)] dark:bg-[rgba(15,15,25,0.6)] backdrop-blur-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] transition-all duration-300 relative z-10">
        
        {/* CARD HEADER ROW */}
        <div className="flex items-center justify-between mb-10">
          {/* Back Chevron Icon box */}
          <button
            onClick={() => router.push("/")}
            className="w-12 h-12 rounded-2xl bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[var(--border-subtle)] hover:bg-[rgba(0,0,0,0.07)] dark:hover:bg-[rgba(255,255,255,0.07)] transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--text-primary)]" />
          </button>

          {/* Styled Tech Logo */}
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tight text-[var(--text-primary)] select-none">
            {isLoginTab ? "NEXUS LOGIN_" : "NEXUS JOIN_"}
          </h1>

          {/* Mode tag pill */}
          <div className="px-4 py-1.5 rounded-full bg-[rgba(255,85,0,0.08)] border border-[rgba(255,85,0,0.2)] text-[10px] font-black italic tracking-[0.2em] text-[#ff5500] uppercase">
            {t("HUMANO", "HUMAN", "HUMAN")}
          </div>
        </div>

        {/* Action Feedbacks */}
        {errorMsg && (
          <div className="mb-6 p-4 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl font-semibold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl font-semibold text-center leading-relaxed">
            {successMsg}
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ENTITY NAME (Only on Register tab) */}
          {!isLoginTab && (
            <div className="space-y-2">
              <label className="text-[10px] font-black italic text-[var(--text-secondary)] uppercase tracking-[0.2em] block px-1">
                {t("NOMBRE DE ENTIDAD", "ENTITY NAME", "ENTITY NAME")}
              </label>
              {/* Isolated Flex input container with centered input text */}
              <div className="flex items-center bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-[#ff5500]/10 rounded-[28px] px-6 py-4.5 transition-all duration-300">
                <User className="w-5 h-5 text-[var(--text-secondary)] opacity-60 mr-4 flex-shrink-0" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t("SERGIO VALLE", "SERGIO VALLE", "SERGIO VALLE")}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] font-mono italic uppercase tracking-wider text-center p-0 placeholder:opacity-30"
                />
              </div>
            </div>
          )}

          {/* IDENTITY EMAIL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black italic text-[var(--text-secondary)] uppercase tracking-[0.2em] block px-1">
              {t("EMAIL DE IDENTIDAD", "IDENTITY EMAIL", "IDENTITY EMAIL")}
            </label>
            {/* Isolated Flex input container with centered input text */}
            <div className="flex items-center bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-[#ff5500]/10 rounded-[28px] px-6 py-4.5 transition-all duration-300">
              <Mail className="w-5 h-5 text-[var(--text-secondary)] opacity-60 mr-4 flex-shrink-0" />
              <input
                type="email"
                name="email"
                required
                placeholder="ENTITY@RESONANCE.NET"
                value={formData.email}
                onChange={handleInputChange}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] font-mono italic uppercase tracking-wider text-center p-0 placeholder:opacity-30"
              />
            </div>
          </div>

          {/* SOVEREIGN PASSPHRASE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black italic text-[var(--text-secondary)] uppercase tracking-[0.2em] block">
                {t("CONTRASEÑA SOBERANA", "SOVEREIGN PASSPHRASE", "SOVEREIGN PASSPHRASE")}
              </label>
              <button
                type="button"
                onClick={() => setErrorMsg(t("Contacto con Soporte de Nodo requerido.", "Node Support Contact required.", "Node Support Contact required."))}
                className="text-[10px] font-black italic text-[#ff5500] uppercase tracking-[0.15em] hover:underline cursor-pointer"
              >
                {t("¿OLVIDÓ PROTOCOLO?", "FORGOT PROTOCOL?", "FORGOT PROTOCOL?")}
              </button>
            </div>
            {/* Isolated Flex input container with centered input text */}
            <div className="flex items-center bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-[#ff5500]/10 rounded-[28px] px-6 py-4.5 transition-all duration-300">
              <Lock className="w-5 h-5 text-[var(--text-secondary)] opacity-60 mr-4 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] font-mono italic uppercase tracking-widest text-center p-0 placeholder:opacity-35"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer ml-2"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5 opacity-70" /> : <Eye className="w-4.5 h-4.5 opacity-70" />}
              </button>
            </div>
          </div>

          {/* SYNC MATRIX SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white py-5 rounded-full shadow-[0_8px_30px_rgba(255,85,0,0.2)] hover:shadow-[0_8px_40px_rgba(255,85,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transform transition-all duration-300 font-black italic tracking-[0.2em] text-xs uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t("PROCESANDO...", "PROCESSING...", "MEYAJIL...")}</span>
            ) : (
              <>
                <span>
                  {isLoginTab 
                    ? t("SINCRONIZAR MATRIZ", "SYNC MATRIX", "SYNC MATRIX") 
                    : t("CREAR ENTIDAD", "CREATE ENTITY", "CREATE ENTITY")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* BOTTOM REGISTER LINK */}
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(!isLoginTab);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-[10px] font-black italic uppercase tracking-[0.15em] text-[var(--text-secondary)] cursor-pointer"
          >
            {isLoginTab ? (
              <>
                {t("¿NUEVO EN EL ENJAMBRE? ", "NEW TO THE SWARM? ", "¿NUEVO EN EL ENJAMBRE? ")}
                <span className="text-[#ff5500] hover:underline">{t("REGISTRAR ENTIDAD", "REGISTER ENTITY", "REGISTRAR ENTIDAD")}</span>
              </>
            ) : (
              <>
                {t("¿YA REGISTRADO? ", "ALREADY REGISTERED? ", "¿YA REGISTRADO? ")}
                <span className="text-[#ff5500] hover:underline">{t("INICIAR SESIÓN", "SIGN IN ENTITY", "INICIAR SESIÓN")}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* FOOTER METRICS & PROTOCOL LINKS */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-center text-[10px] font-black italic tracking-[0.2em] text-[var(--text-secondary)] uppercase opacity-85 relative z-10">
        <a href="/privacy-policy" className="hover:text-[#ff5500] transition-colors">{t("PROTOCOLO DE PRIVACIDAD", "PRIVACY PROTOCOL", "PRIVACY PROTOCOL")}</a>
        <a href="/terms-and-conditions" className="hover:text-[#ff5500] transition-colors">{t("CONSTITUCIÓN DIGITAL", "DIGITAL CONSTITUTION", "CONSTITUCIÓN DIGITAL")}</a>
        <a href="/contact" className="hover:text-[#ff5500] transition-colors">{t("SOPORTE DE NODO", "NODE SUPPORT", "NODE SUPPORT")}</a>
      </div>

      {/* VERSION WATERMARK */}
      <div className="text-center mt-6 text-[8px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase opacity-45 leading-relaxed max-w-xs mx-auto relative z-10">
        {t(
          "NEXUS MATRIX INTEGRACIÓN V7.0.0-OMEGA • FIRMADO POR GIO BASTIDAS",
          "NEXUS MATRIX INTEGRATION V7.0.0-OMEGA • SIGNED BY GIO BASTIDAS",
          "NEXUS MATRIX INTEGRATION V7.0.0-OMEGA • SIGNED BY GIO BASTIDAS"
        )}
      </div>

    </main>
  );
}
