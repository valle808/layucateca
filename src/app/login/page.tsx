"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  CheckCircle, 
  Eye, 
  EyeOff, 
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
      <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-[#050508] transition-colors duration-300 relative overflow-hidden">
        {/* Soft Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(255,85,0,0.04)] blur-[100px] pointer-events-none" />
        
        <div className="p-12 max-w-md w-full text-center border border-[var(--border-accent)] bg-[var(--bg-card)] rounded-[32px] animate-fadeInUp shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[var(--glow-gold)] backdrop-blur-xl relative z-10">
          <div className="w-20 h-20 rounded-full bg-[rgba(255,85,0,0.08)] flex items-center justify-center border border-[rgba(255,85,0,0.2)] mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-[#ff5500]" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide">
            {t("Sesión Activa", "Active Session", "Tsolob Kuxtal")}
          </h2>
          <p className="text-sm text-[rgba(255,255,255,0.6)] mt-4 leading-relaxed font-medium">
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
    <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-[#050508] transition-colors duration-300 relative overflow-hidden">
      
      {/* Floating Background Ambient Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(255,85,0,0.03)] blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(212,168,83,0.02)] blur-[120px] pointer-events-none select-none" />

      {/* PREMIUM OBSIDIAN & GLASS CARD CONTAINER */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md p-10 rounded-[32px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.7)] backdrop-blur-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 relative z-10 overflow-hidden"
      >
        
        {/* Toggle tabs — Framer Motion sliding capsule design */}
        <div className="flex p-1.5 bg-[rgba(0,0,0,0.3)] rounded-full mb-8 border border-[rgba(255,255,255,0.06)] relative overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 cursor-pointer transition-colors duration-300 text-center flex items-center justify-center"
            style={{ color: isLoginTab ? "#ffffff" : "rgba(255, 255, 255, 0.45)" }}
          >
            {t("Iniciar Sesión", "Sign In", "Okol")}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 cursor-pointer transition-colors duration-300 text-center flex items-center justify-center"
            style={{ color: !isLoginTab ? "#ffffff" : "rgba(255, 255, 255, 0.45)" }}
          >
            {t("Registrarse", "Register", "Ts'íib")}
          </button>
          
          {/* Framer motion sliding capsule background */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 bg-[#ff5500] rounded-full shadow-[0_4px_16px_rgba(255,85,0,0.35)] z-0"
            initial={false}
            animate={{
              left: isLoginTab ? "6px" : "calc(50% + 3px)",
              right: isLoginTab ? "calc(50% + 3px)" : "6px",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        </div>

        {/* Portal Header Greeting */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[rgba(255,85,0,0.08)] flex items-center justify-center border border-[rgba(255,85,0,0.2)] mb-4">
            <Shield className="w-6 h-6 text-[#ff5500] animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            {t("Portal de Comunidad", "Community Portal", "Kajil Portal")}
          </h2>
          <p className="text-xs text-[rgba(255,255,255,0.45)] mt-2 leading-relaxed text-center max-w-[280px] font-medium">
            {t(
              "Únete para comentar en noticias, crear salas de debate y acumular reputación.",
              "Join to comment on news, create debate rooms, and build reputation.",
              "Okol ti'al a t'aan ti' péektsil, beeta'al tsikbal yéetel náajaltik reputación."
            )}
          </p>
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

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Framer Motion Animating Container for dynamic height adjustment */}
          <motion.div layout className="space-y-5">
            
            {/* ENTITY NAME FIELD (Only visible in Register mode) */}
            <AnimatePresence initial={false} mode="popLayout">
              {!isLoginTab && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="overflow-hidden space-y-2"
                >
                  {/* Clean Flexbox floating-label field — 100% immune to overlaps */}
                  <div className="relative flex items-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:border-[#ff5500] focus-within:shadow-[0_0_20px_rgba(255,85,0,0.15)] focus-within:scale-[1.01] group mt-1">
                    {/* Dedicated Icon box */}
                    <div className="w-10 h-10 rounded-xl bg-[rgba(255,85,0,0.06)] border border-[rgba(255,85,0,0.12)] flex items-center justify-center mr-4 transition-all duration-300 group-focus-within:bg-[rgba(255,85,0,0.12)] group-focus-within:border-[#ff5500] flex-shrink-0">
                      <User className="w-5 h-5 text-[rgba(255,255,255,0.4)] group-focus-within:text-[#ff5500] transition-colors duration-300" />
                    </div>
                    {/* Floating Label Container */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder=" "
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none outline-none text-sm text-white pt-4 pb-1 peer font-medium placeholder:select-none"
                      />
                      <label className="absolute left-0 top-3 text-xs text-[rgba(255,255,255,0.45)] transition-all duration-300 pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-[-6px] peer-focus:text-xs peer-focus:text-[#ff5500] peer-[:not(:placeholder-shown)]:top-[-6px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#ff5500] font-medium uppercase tracking-wider">
                        {t("Nombre de Entidad", "Entity Name", "Kaba'")}
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IDENTITY EMAIL FIELD */}
            <div className="relative flex items-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:border-[#ff5500] focus-within:shadow-[0_0_20px_rgba(255,85,0,0.15)] focus-within:scale-[1.01] group">
              {/* Dedicated Icon box */}
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,85,0,0.06)] border border-[rgba(255,85,0,0.12)] flex items-center justify-center mr-4 transition-all duration-300 group-focus-within:bg-[rgba(255,85,0,0.12)] group-focus-within:border-[#ff5500] flex-shrink-0">
                <Mail className="w-5 h-5 text-[rgba(255,255,255,0.4)] group-focus-within:text-[#ff5500] transition-colors duration-300" />
              </div>
              {/* Floating Label Container */}
              <div className="flex-1 relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder=" "
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none text-sm text-white pt-4 pb-1 peer font-medium placeholder:select-none"
                />
                <label className="absolute left-0 top-3 text-xs text-[rgba(255,255,255,0.45)] transition-all duration-300 pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-[-6px] peer-focus:text-xs peer-focus:text-[#ff5500] peer-[:not(:placeholder-shown)]:top-[-6px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#ff5500] font-medium uppercase tracking-wider">
                  {t("Correo Electrónico", "Email Address", "Correo")}
                </label>
              </div>
            </div>

            {/* SOVEREIGN PASSPHRASE FIELD */}
            <div className="relative flex items-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:border-[#ff5500] focus-within:shadow-[0_0_20px_rgba(255,85,0,0.15)] focus-within:scale-[1.01] group">
              {/* Dedicated Icon box */}
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,85,0,0.06)] border border-[rgba(255,85,0,0.12)] flex items-center justify-center mr-4 transition-all duration-300 group-focus-within:bg-[rgba(255,85,0,0.12)] group-focus-within:border-[#ff5500] flex-shrink-0">
                <Lock className="w-5 h-5 text-[rgba(255,255,255,0.4)] group-focus-within:text-[#ff5500] transition-colors duration-300" />
              </div>
              {/* Floating Label Container */}
              <div className="flex-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder=" "
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none text-sm text-white pt-4 pb-1 peer font-medium placeholder:select-none"
                />
                <label className="absolute left-0 top-3 text-xs text-[rgba(255,255,255,0.45)] transition-all duration-300 pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-[-6px] peer-focus:text-xs peer-focus:text-[#ff5500] peer-[:not(:placeholder-shown)]:top-[-6px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#ff5500] font-medium uppercase tracking-wider">
                  {t("Contraseña", "Password", "Ta'akil")}
                </label>
              </div>
              {/* Password visibility toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-[#ff5500] transition-colors duration-200 cursor-pointer ml-2"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

          </motion.div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white py-4 mt-8 rounded-full shadow-[0_8px_30px_rgba(255,85,0,0.2)] hover:shadow-[0_8px_40px_rgba(255,85,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transform transition-all duration-300 font-black tracking-widest text-xs uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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

      </motion.div>
    </main>
  );
}
