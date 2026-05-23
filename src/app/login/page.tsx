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
  Sparkles, 
  ArrowRight, 
  Activity, 
  MessageSquare, 
  Globe 
} from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const { login, register, user } = useAuth();
  const router = useRouter();

  const [isLoginTab, setIsLoginTab] = useState(true);
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
        {/* Animated Background Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(255,85,0,0.06)] blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(212,168,83,0.04)] blur-[120px] pointer-events-none animate-pulse-medium" />

        <div className="p-12 max-w-md w-full text-center border border-[var(--border-accent)] bg-[var(--bg-card)] rounded-[32px] animate-fadeInUp shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[var(--glow-gold)] backdrop-blur-xl relative z-10">
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
    <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-[var(--bg-primary)] transition-colors duration-500 relative overflow-hidden">
      {/* CSS Stylesheet Injector for Custom Keyframes & Animations */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.7; }
          33% { transform: scale(1.15) translate(30px, -50px); opacity: 0.9; }
          66% { transform: scale(0.9) translate(-20px, 20px); opacity: 0.5; }
        }
        @keyframes pulse-medium {
          0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.5; }
          50% { transform: scale(1.2) translate(-40px, 40px); opacity: 0.8; }
        }
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes scale-up-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(255, 85, 0, 0.05); }
          50% { box-shadow: 0 0 60px rgba(255, 85, 0, 0.15); }
        }
        .animate-pulse-slow { animation: pulse-slow 18s ease-in-out infinite; }
        .animate-pulse-medium { animation: pulse-medium 12s ease-in-out infinite; }
        .animate-subtle-float { animation: subtle-float 6s ease-in-out infinite; }
        .animate-glow-cycle { animation: scale-up-glow 4s ease-in-out infinite; }
      `}</style>

      {/* Out-of-this-world animated ambient background glows */}
      <div className="absolute top-10 left-10 w-[600px] h-[600px] rounded-full bg-[rgba(255,85,0,0.06)] dark:bg-[rgba(255,85,0,0.03)] blur-[140px] pointer-events-none animate-pulse-slow z-0" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full bg-[rgba(212,168,83,0.04)] dark:bg-[rgba(212,168,83,0.02)] blur-[140px] pointer-events-none animate-pulse-medium z-0" />
      
      {/* Main Double-Column Bento Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 items-stretch px-2 md:px-6">
        
        {/* LEFT COLUMN: Premium Brand Typographic & Stats Bento Card */}
        <div className="md:col-span-5 flex flex-col justify-between p-8 md:p-10 rounded-[32px] border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.01)] dark:bg-[rgba(10,10,15,0.2)] backdrop-blur-md shadow-sm overflow-hidden relative animate-subtle-float">
          {/* Subtle geometric line art background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01] pointer-events-none select-none">
            <svg width="100%" height="100%">
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          {/* Top Brand Tag Section */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(255,85,0,0.08)] border border-[rgba(255,85,0,0.2)] mb-8 text-xs font-black tracking-widest text-[#ff5500] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("Comunidad", "Community", "Kajil")}</span>
            </div>

            {/* Typography Masterpiece */}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--text-primary)] leading-[1.1] mb-6">
              La <span className="text-[#ff5500]">Yucateca</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium leading-relaxed max-w-[280px]">
              {t(
                "El latido digital de la península. Noticias, opinión, mercado y debates en un solo espacio soberano.",
                "The digital heartbeat of the peninsula. News, opinions, marketplace, and debates in one sovereign space.",
                "U yich u t'aan k'áax. Péektsil, k'áat chi', mercado yéetel tsikbalil."
              )}
            </p>
          </div>

          {/* Faded Mayan Quote Background Overlay */}
          <div className="absolute right-[-40px] top-[40%] text-[8rem] font-serif font-black select-none pointer-events-none opacity-[0.03] dark:opacity-[0.01] rotate-90 leading-none">
            MAYA
          </div>

          {/* Bottom Bento Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mt-12 relative z-10">
            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] transition-all duration-300 hover:border-[#ff5500]/30 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[rgba(255,85,0,0.08)] flex items-center justify-center mb-3">
                <Activity className="w-4 h-4 text-[#ff5500]" />
              </div>
              <div className="text-lg font-black text-[var(--text-primary)]">📰 Active</div>
              <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                {t("Noticias", "News", "Péektsil")}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] transition-all duration-300 hover:border-[#ff5500]/30 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[rgba(255,85,0,0.08)] flex items-center justify-center mb-3">
                <MessageSquare className="w-4 h-4 text-[#ff5500]" />
              </div>
              <div className="text-lg font-black text-[var(--text-primary)]">💬 +24 Rooms</div>
              <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                {t("Debates", "Debates", "Tsolob")}
              </div>
            </div>

            <div className="col-span-2 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] transition-all duration-300 hover:border-[#ff5500]/30 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(255,85,0,0.08)] flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#ff5500]" />
                </div>
                <div>
                  <div className="text-xs font-black text-[var(--text-primary)]">Español | English | Maya</div>
                  <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">
                    {t("Lenguaje Soberano", "Sovereign Language", "Kajil T'aan")}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Frosted "Liquid Glass" Form Card */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="w-full p-8 md:p-12 rounded-[32px] border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,15,25,0.45)] backdrop-blur-2xl shadow-[0_25px_65px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_65px_-15px_rgba(0,0,0,0.35)] animate-glow-cycle transition-all duration-300 relative">
            
            {/* Header Badge */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-[rgba(255,85,0,0.08)] flex items-center justify-center border border-[rgba(255,85,0,0.2)] mb-4 animate-bounce-slow">
                <Shield className="w-6 h-6 text-[#ff5500]" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-wide">
                {t("Portal de Comunidad", "Community Portal", "Kajil Portal")}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed text-center max-w-[340px] font-medium opacity-80">
                {t(
                  "Únete para comentar en noticias, crear salas de debate y acumular reputación.",
                  "Join to comment on news, create debate rooms, and build reputation.",
                  "Okol ti'al a t'aan ti' péektsil, beeta'al tsikbal yéetel náajaltik reputación."
                )}
              </p>
            </div>

            {/* Sliding Pill tab switcher */}
            <div className="flex p-1 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] rounded-full mb-8 border border-[var(--border-subtle)] relative transition-all duration-300">
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(true);
                  setErrorMsg("");
                }}
                className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 cursor-pointer ${
                  isLoginTab 
                    ? "text-white" 
                    : "text-[var(--text-secondary)] opacity-80 hover:opacity-100"
                }`}
              >
                {t("Iniciar Sesión", "Sign In", "Okol")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(false);
                  setErrorMsg("");
                }}
                className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 cursor-pointer ${
                  !isLoginTab 
                    ? "text-white" 
                    : "text-[var(--text-secondary)] opacity-80 hover:opacity-100"
                }`}
              >
                {t("Registrarse", "Register", "Ts'íib")}
              </button>
              <div 
                className="absolute top-1 bottom-1 transition-all duration-300 bg-[#ff5500] rounded-full shadow-[0_4px_16px_rgba(255,85,0,0.3)]" 
                style={{ 
                  left: isLoginTab ? '4px' : '50%', 
                  right: isLoginTab ? '50%' : '4px' 
                }} 
              />
            </div>

            {/* Action Feedback Messages */}
            {errorMsg && (
              <div className="mb-6 p-4 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl animate-shake font-semibold text-center leading-relaxed">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl font-semibold text-center leading-relaxed">
                {successMsg}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Field (Register Mode Only) */}
              {!isLoginTab && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block px-1 opacity-80">
                    {t("Nombre", "Name", "Kaba'")}
                  </label>
                  {/* Clean Flex input block — completely isolated */}
                  <div className="flex items-center bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-[#ff5500]/10 rounded-2xl px-4 py-3.5 transition-all duration-200 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(255,85,0,0.06)] flex items-center justify-center border border-[rgba(255,85,0,0.12)] mr-4 flex-shrink-0">
                      <User className="w-5 h-5 text-[#ff5500] opacity-80" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder={t("e.g. Sergio Valle", "e.g. Sergio Valle", "e.g. Sergio Valle")}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] font-semibold p-0 placeholder:opacity-40"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block px-1 opacity-80">
                  {t("Correo Electrónico", "Email Address", "Correo")}
                </label>
                {/* Clean Flex input block — completely isolated */}
                <div className="flex items-center bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-[#ff5500]/10 rounded-2xl px-4 py-3.5 transition-all duration-200 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,85,0,0.06)] flex items-center justify-center border border-[rgba(255,85,0,0.12)] mr-4 flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#ff5500] opacity-80" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="sergio@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] font-semibold p-0 placeholder:opacity-40"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block px-1 opacity-80">
                  {t("Contraseña", "Password", "Ta'akil")}
                </label>
                {/* Clean Flex input block — completely isolated */}
                <div className="flex items-center bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-[#ff5500]/10 rounded-2xl px-4 py-3.5 transition-all duration-200 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,85,0,0.06)] flex items-center justify-center border border-[rgba(255,85,0,0.12)] mr-4 flex-shrink-0">
                    <Lock className="w-5 h-5 text-[#ff5500] opacity-80" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] font-semibold p-0 placeholder:opacity-40"
                  />
                </div>
              </div>

              {/* Extraordinary Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white py-4 mt-8 rounded-full shadow-[0_8px_30px_rgba(255,85,0,0.25)] hover:shadow-[0_8px_40px_rgba(255,85,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 transform transition-all duration-300 font-black tracking-widest text-xs uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>{t("Procesando...", "Processing...", "Meyajil...")}</span>
                ) : (
                  <>
                    <span>
                      {isLoginTab 
                        ? t("Iniciar Sesión", "Sign In", "Okol") 
                        : t("Crear Cuenta", "Create Account", "Beeta'al ts'íib")}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
