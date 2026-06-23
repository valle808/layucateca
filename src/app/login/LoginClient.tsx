"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Shield, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const { login, register, user } = useAuth();
  const router = useRouter();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (user) {
    setTimeout(() => router.push("/"), 1000);
    return (
      <main style={styles.page}>
        <div style={styles.successCard}>
          <CheckCircle style={{ color: "#ff5500", width: 44, height: 44, marginBottom: 16 }} />
          <h2 style={styles.successTitle}>Sesión Activa</h2>
          <p style={styles.successSub}>Hola {user.name}, redirigiéndote...</p>
        </div>
      </main>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      if (isLoginTab) {
        const res = await login({ email: formData.email, password: formData.password });
        if (res.success) router.push("/");
        else setErrorMsg(res.error || "Error de inicio de sesión.");
      } else {
        const res = await register(formData);
        if (res.success) {
          setSuccessMsg("¡Registro exitoso! Iniciando sesión...");
          setTimeout(() => router.push("/"), 1500);
        } else {
          setErrorMsg(res.error || "Error al registrarse.");
        }
      }
    } catch { setErrorMsg("Error de red."); }
    finally { setLoading(false); }
  };

  return (
    <main style={styles.page}>
      {/* Left brand panel */}
      <div style={styles.brandPanel}>
        <div style={styles.brandInner}>
          <div style={styles.brandLogo}>
            <span style={styles.brandLogoText}>LA</span>
          </div>
          <h1 style={styles.brandTitle}>La Yucateca</h1>
          <p style={styles.brandTagline}>
            El portal de noticias, comunidad y soluciones digitales del sureste mexicano.
          </p>
          <div style={styles.featureList}>
            {[
              "Noticias en tiempo real de Yucatán",
              "Comunidad y debate ciudadano",
              "Reportes vecinales interactivos",
              "Acceso a soluciones digitales",
            ].map((f) => (
              <div key={f} style={styles.featureItem}>
                <div style={styles.featureDot} />
                <span style={styles.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* decorative blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
      </div>

      {/* Right form panel */}
      <div style={styles.formPanel}>
        <div style={styles.formCard}>
          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.formIconRing}>
              <Shield style={{ width: 20, height: 20, color: "#ff5500" }} />
            </div>
            <h2 style={styles.formTitle}>Portal de Comunidad</h2>
            <p style={styles.formSubtitle}>
              Únete para comentar, debatir y acumular reputación ciudadana.
            </p>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {(["Iniciar Sesión", "Registrarse"] as const).map((label, i) => {
              const active = i === 0 ? isLoginTab : !isLoginTab;
              return (
                <button
                  key={label}
                  onClick={() => { setIsLoginTab(i === 0); setErrorMsg(""); }}
                  style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Alerts */}
          {errorMsg && <div style={styles.alertError}>{errorMsg}</div>}
          {successMsg && <div style={styles.alertSuccess}>{successMsg}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLoginTab && (
              <>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Nombre</label>
                  <div style={styles.inputWrapper}>
                    <User style={styles.inputIcon} />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Itzamná Cauich"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={styles.input}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#ff5500"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,85,0,0.12)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={{ ...styles.label, color: "#ff5500" }}>Código de Acceso</label>
                  <div style={styles.inputWrapper}>
                    <Sparkles style={{ ...styles.inputIcon, color: "#ff5500" }} />
                    <input
                      type="text"
                      name="accessCode"
                      required
                      placeholder="Requerido para el proyecto de IA"
                      value={(formData as any).accessCode || ""}
                      onChange={handleInputChange}
                      style={{ ...styles.input, borderColor: "rgba(255,85,0,0.3)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#ff5500"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,85,0,0.12)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,85,0,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Correo Electrónico</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="itzamna@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#ff5500"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,85,0,0.12)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#ff5500"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,85,0,0.12)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Procesando...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isLoginTab ? "Iniciar Sesión" : "Crear Cuenta"}
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </span>
              )}
            </button>
          </form>

          <p style={styles.footerNote}>
            Al continuar, aceptas nuestros{" "}
            <a href="/terms" style={styles.footerLink}>Términos de uso</a> y{" "}
            <a href="/privacy" style={styles.footerLink}>Política de privacidad</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    background: "#ffffff",
  },
  // Brand / left panel
  brandPanel: {
    flex: "0 0 420px",
    background: "linear-gradient(145deg, #111 0%, #1a1a22 40%, #0d0d14 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    position: "relative",
    overflow: "hidden",
  },
  brandInner: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  brandLogo: {
    width: 56,
    height: 56,
    background: "#ff5500",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    boxShadow: "0 8px 32px rgba(255,85,0,0.4)",
  },
  brandLogoText: {
    color: "#fff",
    fontWeight: 900,
    fontSize: "1.2rem",
    letterSpacing: "-0.03em",
  },
  brandTitle: {
    fontSize: "2rem",
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-0.03em",
    marginBottom: 14,
    lineHeight: 1.1,
  },
  brandTagline: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.52)",
    lineHeight: 1.65,
    marginBottom: 40,
    maxWidth: 300,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  featureDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#ff5500",
    flexShrink: 0,
    boxShadow: "0 0 8px rgba(255,85,0,0.6)",
  },
  featureText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.875rem",
    lineHeight: 1.4,
  },
  blob1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,85,0,0.18) 0%, transparent 70%)",
    zIndex: 1,
  },
  blob2: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,85,0,0.10) 0%, transparent 70%)",
    zIndex: 1,
  },
  // Form panel
  formPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 32px",
    background: "#f7f7f9",
    overflowY: "auto",
  },
  formCard: {
    width: "100%",
    maxWidth: 440,
    background: "#ffffff",
    borderRadius: 20,
    padding: "40px 36px",
    boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
  },
  formHeader: {
    textAlign: "center",
    marginBottom: 28,
  },
  formIconRing: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "rgba(255,85,0,0.1)",
    border: "1.5px solid rgba(255,85,0,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  formTitle: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#111113",
    letterSpacing: "-0.025em",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: "0.82rem",
    color: "#6e6e80",
    lineHeight: 1.55,
  },
  // Tabs
  tabs: {
    display: "flex",
    background: "#f3f3f6",
    borderRadius: 11,
    padding: 4,
    gap: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: "9px 16px",
    fontSize: "0.8rem",
    fontWeight: 600,
    textAlign: "center" as const,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    background: "transparent",
    color: "#6e6e80",
    transition: "all 0.18s ease",
    letterSpacing: "0.01em",
  },
  tabActive: {
    background: "#ffffff",
    color: "#111113",
    boxShadow: "0 1px 6px rgba(0,0,0,0.09)",
  },
  // Alerts
  alertError: {
    padding: "10px 14px",
    fontSize: "0.82rem",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.22)",
    color: "#dc2626",
    borderRadius: 10,
    marginBottom: 16,
    lineHeight: 1.4,
  },
  alertSuccess: {
    padding: "10px 14px",
    fontSize: "0.82rem",
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#16a34a",
    borderRadius: 10,
    marginBottom: 16,
    lineHeight: 1.4,
  },
  // Form fields
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#6e6e80",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute" as const,
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    width: 15,
    height: 15,
    color: "#9999a8",
    pointerEvents: "none" as const,
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "11px 14px 11px 38px",
    fontSize: "0.9rem",
    border: "1.5px solid rgba(0,0,0,0.12)",
    borderRadius: 10,
    color: "#111113",
    background: "#fafafa",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
  },
  submitBtn: {
    marginTop: 8,
    width: "100%",
    padding: "13px 24px",
    background: "#ff5500",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "0.92rem",
    border: "none",
    borderRadius: 11,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.18s ease, box-shadow 0.18s ease",
    boxShadow: "0 4px 16px rgba(255,85,0,0.28)",
    letterSpacing: "0.01em",
  },
  footerNote: {
    marginTop: 20,
    fontSize: "0.75rem",
    color: "#9999a8",
    textAlign: "center" as const,
    lineHeight: 1.5,
  },
  footerLink: {
    color: "#ff5500",
    textDecoration: "underline",
    fontWeight: 600,
  },
  // Logged-in state
  successCard: {
    background: "#fff",
    borderRadius: 20,
    padding: "48px 40px",
    maxWidth: 340,
    textAlign: "center",
    boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  successTitle: { fontSize: "1.2rem", fontWeight: 800, color: "#111113", marginBottom: 8 },
  successSub: { fontSize: "0.875rem", color: "#6e6e80" },
};
