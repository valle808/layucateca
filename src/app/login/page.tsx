"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Shield, CheckCircle } from "lucide-react";

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
        {/* Modern Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[rgba(255,85,0,0.06)] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[rgba(212,168,83,0.04)] blur-[100px] pointer-events-none" />

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
    <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-[var(--bg-primary)] transition-colors duration-300 relative overflow-hidden">
      {/* Modern Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(255,85,0,0.05)] dark:bg-[rgba(255,85,0,0.03)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(212,168,83,0.03)] dark:bg-[rgba(212,168,83,0.02)] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-10 rounded-[32px] border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] transition-all duration-300 relative z-10">
        {/* Toggle tabs — sliding pill design */}
        <div className="flex p-1.5 bg-[var(--bg-primary)] rounded-full mb-8 border border-[var(--border-subtle)] relative transition-colors duration-300">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg("");
            }}
            className={`flex-1 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 cursor-pointer ${
              isLoginTab 
                ? "text-white" 
                : "text-[var(--text-secondary)] opacity-85 hover:opacity-100"
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
            className={`flex-1 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 cursor-pointer ${
              !isLoginTab 
                ? "text-white" 
                : "text-[var(--text-secondary)] opacity-85 hover:opacity-100"
            }`}
          >
            {t("Registrarse", "Register", "Ts'íib")}
          </button>
          <div 
            className="absolute top-1.5 bottom-1.5 transition-all duration-300 bg-[#ff5500] rounded-full shadow-[0_4px_16px_rgba(255,85,0,0.35)]" 
            style={{ 
              left: isLoginTab ? '6px' : '50%', 
              right: isLoginTab ? '50%' : '6px' 
            }} 
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[rgba(255,85,0,0.08)] flex items-center justify-center border border-[rgba(255,85,0,0.2)] mb-4 animate-float">
              <Shield className="w-6 h-6 text-[#ff5500]" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-wide">
              {t("Portal de Comunidad", "Community Portal", "Kajil Portal")}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed text-center max-w-[280px] font-medium opacity-80">
              {t(
                "Únete para comentar en noticias, crear salas de debate y acumular reputación.",
                "Join to comment on news, create debate rooms, and build reputation.",
                "Okol ti'al a t'aan ti' péektsil, beeta'al tsikbal yéetel náajaltik reputación."
              )}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl animate-shake font-semibold text-center leading-relaxed">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl font-semibold text-center leading-relaxed">
              {successMsg}
            </div>
          )}

          {!isLoginTab && (
            <div>
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2 px-1 opacity-75">
                {t("Nombre", "Name", "Kaba'")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-secondary)] pointer-events-none z-20">
                  <User className="w-4 h-4 opacity-75" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t("e.g. Sergio Valle", "e.g. Sergio Valle", "e.g. Sergio Valle")}
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ paddingLeft: "44px" }}
                  className="input py-4 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border-subtle)] focus:border-[#ff5500] rounded-2xl font-medium transition-all duration-200 shadow-sm relative z-10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2 px-1 opacity-75">
              {t("Correo Electrónico", "Email Address", "Correo")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-secondary)] pointer-events-none z-20">
                <Mail className="w-4 h-4 opacity-75" />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="sergio@example.com"
                value={formData.email}
                onChange={handleInputChange}
                style={{ paddingLeft: "44px" }}
                className="input py-4 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border-subtle)] focus:border-[#ff5500] rounded-2xl font-medium transition-all duration-200 shadow-sm relative z-10"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2 px-1 opacity-75">
              {t("Contraseña", "Password", "Ta'akil")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-secondary)] pointer-events-none z-20">
                <Lock className="w-4 h-4 opacity-75" />
              </span>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                style={{ paddingLeft: "44px" }}
                className="input py-4 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border-subtle)] focus:border-[#ff5500] rounded-2xl font-medium transition-all duration-200 shadow-sm relative z-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white py-4 mt-8 rounded-full shadow-[0_8px_30px_rgba(255,85,0,0.25)] hover:shadow-[0_8px_40px_rgba(255,85,0,0.35)] transform hover:-translate-y-0.5 transition-all duration-300 font-black tracking-widest text-xs uppercase cursor-pointer disabled:opacity-50"
          >
            {loading 
              ? t("Procesando...", "Processing...", "Meyajil...") 
              : isLoginTab 
                ? t("Iniciar Sesión", "Sign In", "Okol") 
                : t("Crear Cuenta", "Create Account", "Beeta'al ts'íib")}
          </button>
        </form>
      </div>
    </main>
  );
}
