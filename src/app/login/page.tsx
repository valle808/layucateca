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
      <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-[var(--bg-primary)] transition-colors duration-300">
        <div className="p-8 max-w-sm w-full text-center border border-[var(--border-accent)] bg-[var(--bg-card)] rounded-3xl animate-fadeInUp shadow-[var(--glow-gold)] backdrop-blur-xl">
          <CheckCircle className="w-16 h-16 text-[#ff5500] mx-auto mb-5 animate-pulse" />
          <h2 className="text-2xl font-black text-[var(--text-primary)]">
            {t("Sesión Activa", "Active Session", "Tsolob Kuxtal")}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-3">
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
    <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-[var(--bg-primary)] transition-colors duration-300">
      <div className="w-full max-w-md p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl shadow-[var(--glow-gold)] transition-all duration-300">
        {/* Toggle tabs */}
        <div className="flex border-b border-[var(--border-subtle)] pb-4 mb-6">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg("");
            }}
            className={`flex-1 text-center font-black text-xs uppercase tracking-widest pb-2 transition-all duration-200 ${
              isLoginTab 
                ? "text-[var(--text-primary)] border-b-2 border-[#ff5500]" 
                : "text-[var(--text-secondary)] opacity-60 hover:opacity-100"
            }`}
          >
            {t("Iniciar Sesión", "Sign In", "Okol")}
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg("");
            }}
            className={`flex-1 text-center font-black text-xs uppercase tracking-widest pb-2 transition-all duration-200 ${
              !isLoginTab 
                ? "text-[var(--text-primary)] border-b-2 border-[#ff5500]" 
                : "text-[var(--text-secondary)] opacity-60 hover:opacity-100"
            }`}
          >
            {t("Registrarse", "Register", "Ts'íib")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-[var(--text-primary)] flex justify-center items-center gap-2">
              <Shield className="w-6 h-6 text-[#ff5500]" />
              {t("Portal de Comunidad", "Community Portal", "Kajil Portal")}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
              {t(
                "Únete para comentar en noticias, crear salas de debate y acumular reputación.",
                "Join to comment on news, create debate rooms, and build reputation points.",
                "Okol ti'al a t'aan ti' péektsil, beeta'al tsikbal yéetel náajaltik reputación."
              )}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl animate-shake">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl">
              {successMsg}
            </div>
          )}

          {!isLoginTab && (
            <div>
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                {t("Nombre", "Name", "Kaba'")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--text-secondary)] pointer-events-none">
                  <User className="w-4 h-4 opacity-75" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t("e.g. Sergio Valle", "e.g. Sergio Valle", "e.g. Sergio Valle")}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input pl-10 text-xs text-[var(--text-primary)] font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
              {t("Correo Electrónico", "Email Address", "Correo")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--text-secondary)] pointer-events-none">
                <Mail className="w-4 h-4 opacity-75" />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="sergio@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="input pl-10 text-xs text-[var(--text-primary)] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
              {t("Contraseña", "Password", "Ta'akil")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--text-secondary)] pointer-events-none">
                <Lock className="w-4 h-4 opacity-75" />
              </span>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="input pl-10 text-xs text-[var(--text-primary)] font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] py-3.5 mt-6 text-xs font-black tracking-widest uppercase transition-all duration-300"
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
