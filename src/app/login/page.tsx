"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
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
  const { theme } = useTheme();
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

  const isDark = theme === "dark";

  if (user) {
    // Redirect if already logged in
    setTimeout(() => {
      router.push("/");
    }, 1200);

    return (
      <main className={`min-h-screen pt-36 pb-16 flex items-center justify-center px-4 transition-colors duration-300 relative overflow-hidden bg-gradient-to-br ${
        isDark 
          ? "from-[#020205] via-[#050510] to-[#0a0518]" 
          : "from-[#f7f4ed] via-[#f2ecd9] to-[#ebdcb9]"
      }`}>
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(255,85,0,0.04)] blur-[100px] pointer-events-none" />
        
        <div className={`p-12 max-w-md w-full text-center border rounded-[32px] animate-fadeInUp backdrop-blur-xl relative z-10 ${
          isDark
            ? "border-white/10 bg-black/40 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)]"
            : "border-black/5 bg-white/70 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.08)]"
        }`}>
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
    <main className={`min-h-screen pt-36 pb-20 flex items-center justify-center px-4 transition-colors duration-300 relative overflow-hidden bg-gradient-to-br ${
      isDark 
        ? "from-[#020205] via-[#050510] to-[#0a0518]" 
        : "from-[#f7f4ed] via-[#f2ecd9] to-[#ebdcb9]"
    }`}>
      
      {/* Floating Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(255,85,0,0.03)] blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(212,168,83,0.02)] blur-[120px] pointer-events-none select-none" />

      {/* PREMIUM OBSIDIAN & GLASS CARD CONTAINER - Generous paddings (px-10 py-12 md:py-16) to provide breathing room */}
      <div 
        className={`w-full max-w-md p-10 md:py-16 md:px-12 rounded-[32px] border backdrop-blur-3xl transition-all duration-300 relative z-10 overflow-hidden space-y-10 ${
          isDark 
            ? "border-white/10 bg-black/40 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)]" 
            : "border-black/5 bg-white/75 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.08)]"
        }`}
      >
        
        {/* 1. Animated Segmented control Toggle tabs - Spacious design */}
        <div className={`flex p-2 rounded-full border relative overflow-hidden transition-all duration-300 ${
          isDark 
            ? "bg-black/40 border-white/10" 
            : "bg-black/5 border-black/5"
        }`}>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 cursor-pointer transition-colors duration-300 text-center flex items-center justify-center animate-none"
            style={{ color: isLoginTab ? (isDark ? "#ffffff" : "#1a1208") : (isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(26, 18, 8, 0.45)") }}
          >
            {t("SIGN IN", "SIGN IN", "SIGN IN")}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 cursor-pointer transition-colors duration-300 text-center flex items-center justify-center animate-none"
            style={{ color: !isLoginTab ? (isDark ? "#ffffff" : "#1a1208") : (isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(26, 18, 8, 0.45)") }}
          >
            {t("REGISTER", "REGISTER", "REGISTER")}
          </button>
          
          {/* Framer motion sliding active background pill */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-[0_4px_16px_rgba(239,68,68,0.25)] z-0"
            initial={false}
            animate={{
              left: isLoginTab ? "6px" : "calc(50% + 3px)",
              right: isLoginTab ? "calc(50% + 3px)" : "6px",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        </div>

        {/* 2. Shield Icon with Pulsing Energy Forcefield - Spacious layouts */}
        <div className="flex flex-col items-center relative space-y-6 pt-2">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,85,0,0.06)] border border-[rgba(255,85,0,0.15)] flex items-center justify-center relative shadow-[0_0_20px_rgba(255,85,0,0.1)]">
            <Shield className="w-6 h-6 text-[#ff5500] animate-pulse" />
            
            {/* Forcefield ring effect */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border border-[#ff5500]/30 pointer-events-none"
            />
          </div>
          
          {/* 3. Headers */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] uppercase">
              {t("Community Portal", "Community Portal", "Community Portal")}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[300px] mx-auto font-medium opacity-80">
              {t(
                "Únete para comentar en noticias, crear salas de debate y acumular reputación.",
                "Join to comment on news, create debate rooms, and build reputation.",
                "Okol ti'al a t'aan ti' péektsil, beeta'al tsikbal yéetel náajaltik reputación."
              )}
            </p>
          </div>
        </div>

        {/* Action Feedbacks */}
        {errorMsg && (
          <div className="p-4 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl font-semibold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl font-semibold text-center leading-relaxed">
            {successMsg}
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Spacious vertical spacing wrapper - No Framer Motion layout collapsing */}
          <div className="space-y-6">
            
            {/* ENTITY NAME FIELD (Only visible in Register mode) */}
            <AnimatePresence initial={false} mode="popLayout">
              {!isLoginTab && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="overflow-hidden space-y-2.5"
                >
                  {/* Outside label placement (With elegant bottom margin and letter spacing) */}
                  <label className="text-[10px] font-black text-[#ff5500] uppercase tracking-[0.25em] block px-1.5 opacity-90 mb-1">
                    {t("Nombre de Entidad", "Entity Name / Call Sign", "Nombre")}
                  </label>
                  
                  {/* Premium Spacious Crystal Input Structure (Generous padding - p-3.5) */}
                  <div className={`flex items-center border rounded-2xl p-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:scale-[1.01] group ${
                    isDark 
                      ? "bg-black/35 border-white/10" 
                      : "bg-white/40 border-black/10 shadow-sm"
                  }`}>
                    {/* Spacious left icon section with sleek vertical divider */}
                    <div className={`flex items-center justify-center pr-3 mr-3 border-r transition-colors duration-300 flex-shrink-0 ${
                      isDark ? "border-white/10" : "border-black/10"
                    }`}>
                      <User className={`w-5 h-5 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                    </div>
                    
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder={t("e.g. Sergio Valle", "e.g. Sergio Valle", "e.g. Sergio Valle")}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] py-1 font-semibold placeholder:opacity-30"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IDENTITY EMAIL FIELD */}
            <div className="space-y-2.5">
              {/* Outside label placement */}
              <label className="text-[10px] font-black text-[#ff5500] uppercase tracking-[0.25em] block px-1.5 opacity-90 mb-1">
                {t("EMAIL ADDRESS", "EMAIL ADDRESS", "EMAIL ADDRESS")}
              </label>
              
              {/* Premium Spacious Crystal Input Structure (Generous padding - p-3.5) */}
              <div className={`flex items-center border rounded-2xl p-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:scale-[1.01] group ${
                isDark 
                  ? "bg-black/35 border-white/10" 
                  : "bg-white/40 border-black/10 shadow-sm"
              }`}>
                {/* Spacious left icon section with sleek vertical divider */}
                <div className={`flex items-center justify-center pr-3 mr-3 border-r transition-colors duration-300 flex-shrink-0 ${
                  isDark ? "border-white/10" : "border-black/10"
                }`}>
                  <Mail className={`w-5 h-5 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                </div>
                
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="sergio@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] py-1 font-semibold placeholder:opacity-30"
                />
              </div>
            </div>

            {/* SOVEREIGN PASSWORD FIELD */}
            <div className="space-y-2.5">
              {/* Outside label placement */}
              <label className="text-[10px] font-black text-[#ff5500] uppercase tracking-[0.25em] block px-1.5 opacity-90 mb-1">
                {t("PASSWORD", "PASSWORD", "PASSWORD")}
              </label>
              
              {/* Premium Spacious Crystal Input Structure (Generous padding - p-3.5) */}
              <div className={`flex items-center border rounded-2xl p-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:scale-[1.01] group ${
                isDark 
                  ? "bg-black/35 border-white/10" 
                  : "bg-white/40 border-black/10 shadow-sm"
              }`}>
                {/* Spacious left icon section with sleek vertical divider */}
                <div className={`flex items-center justify-center pr-3 mr-3 border-r transition-colors duration-300 flex-shrink-0 ${
                  isDark ? "border-white/10" : "border-black/10"
                }`}>
                  <Lock className={`w-5 h-5 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                </div>
                
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] py-1 font-semibold placeholder:opacity-30"
                />
                
                {/* Password visibility toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 cursor-pointer ml-1 hover:text-[#ff5500] ${
                    isDark ? "text-white/45" : "text-black/45"
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* 5. Primary Action Button - Pushed away cleanly with mt-10 */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4.5 mt-10 rounded-full shadow-[0_8px_30px_rgba(239,68,68,0.25)] hover:shadow-[0_8px_45px_rgba(239,68,68,0.35)] transform transition-all duration-300 font-black tracking-widest text-xs uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t("Procesando...", "Processing...", "Meyajil...")}</span>
            ) : (
              <>
                <span>
                  {isLoginTab 
                    ? t("SIGN IN", "SIGN IN", "SIGN IN") 
                    : t("CREATE ACCOUNT", "CREATE ACCOUNT", "CREATE ACCOUNT")}
                </span>
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </motion.button>
        </form>

      </div>
    </main>
  );
}
