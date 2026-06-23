"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Shield, Sparkles, CheckCircle } from "lucide-react";

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
    }, 1000);

    return (
      <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
        <div className="p-8 max-w-sm w-full text-center border border-[rgba(255,85,0,0.2)] bg-[rgba(15,15,25,0.45)] rounded-2xl animate-fadeInUp">
          <CheckCircle className="w-12 h-12 text-[#ff5500] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Sesión Activa</h2>
          <p className="text-xs text-[rgba(255,255,255,0.55)] mt-2">Hola {user.name}, redirigiéndote al inicio...</p>
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
          setErrorMsg(res.error || "Error de inicio de sesión.");
        }
      } else {
        const res = await register(formData);
        if (res.success) {
          setSuccessMsg("¡Registro exitoso! Iniciando sesión...");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          setErrorMsg(res.error || "Error al registrarse.");
        }
      }
    } catch (err) {
      setErrorMsg("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,15,25,0.45)] backdrop-blur-md shadow-[0_0_50px_rgba(255,85,0,0.05)]">
        {/* Toggle tabs */}
        <div className="flex border-b border-[rgba(255,255,255,0.08)] pb-4 mb-6">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg("");
            }}
            className={`flex-1 text-center font-bold text-xs uppercase tracking-wider pb-2 transition-all ${
              isLoginTab ? "text-white border-b-2 border-[#ff5500]" : "text-[rgba(255,255,255,0.45)]"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg("");
            }}
            className={`flex-1 text-center font-bold text-xs uppercase tracking-wider pb-2 transition-all ${
              !isLoginTab ? "text-white border-b-2 border-[#ff5500]" : "text-[rgba(255,255,255,0.45)]"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-white flex justify-center items-center gap-2">
              <Shield className="w-5 h-5 text-[#ff5500]" />
              Portal de Comunidad
            </h2>
            <p className="text-[10px] text-[rgba(255,255,255,0.5)] mt-1">
              Únete para comentar en noticias, crear salas de debate y acumular puntos de reputación.
            </p>
          </div>

          {errorMsg && <div className="p-3 text-xs bg-[rgba(255,0,0,0.1)] border border-red-500/30 text-red-400 rounded-lg">{errorMsg}</div>}
          {successMsg && <div className="p-3 text-xs bg-[rgba(0,255,0,0.1)] border border-emerald-500/30 text-emerald-400 rounded-lg">{successMsg}</div>}

          {!isLoginTab && (
            <>
              <div>
                <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">Nombre</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[rgba(255,255,255,0.45)] pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sergio Valle"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#ff5500] uppercase block mb-1 mt-4">Código de Acceso del Proyecto</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ff5500] pointer-events-none">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="accessCode"
                    required
                    placeholder="Requerido para el proyecto de IA"
                    value={(formData as any).accessCode || ""}
                    onChange={handleInputChange}
                    className="input pl-10 text-xs border-[#ff5500]/30 focus:border-[#ff5500] focus:ring-[#ff5500]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[rgba(255,255,255,0.45)] pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="sergio@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="input pl-10 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[rgba(255,255,255,0.45)] pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="input pl-10 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] py-3 mt-6 text-xs font-bold"
          >
            {loading ? "Procesando..." : isLoginTab ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}
