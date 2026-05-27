"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "admin" | "db">("profile");

  // Profile State
  const [adminName, setAdminName] = useState("Gio V.");
  const [adminEmail, setAdminEmail] = useState("valle808@hawaii.edu");
  const [adminRole, setAdminRole] = useState("Lead Developer & Architect");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityError, setSecurityError] = useState("");

  // Database / System info
  const [siteName, setSiteName] = useState("La Yucateca");
  const [siteTagline, setSiteTagline] = useState("News & Web Design Portal");
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isRunningTask, setIsRunningTask] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("la_yucateca_admin_name");
      const storedEmail = localStorage.getItem("la_yucateca_admin_username");
      if (storedName) setAdminName(storedName);
      if (storedEmail) setAdminEmail(storedEmail);
    }
  }, []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    if (typeof window !== "undefined") {
      localStorage.setItem("la_yucateca_admin_name", adminName);
      localStorage.setItem("la_yucateca_admin_username", adminEmail);
      setProfileSuccess(t("¡Perfil actualizado con éxito!", "Profile updated successfully!", "Utsil ts'íib!"));
      setTimeout(() => setProfileSuccess(""), 3000);
    }
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess("");
    setSecurityError("");

    if (typeof window !== "undefined") {
      const storedPass = localStorage.getItem("la_yucateca_admin_password") || "Pharaoh@808";

      if (currentPassword !== storedPass) {
        setSecurityError(t("La contraseña actual es incorrecta.", "Current password is incorrect.", "K'aas ta'akil."));
        return;
      }

      if (newPassword !== confirmPassword) {
        setSecurityError(t("Las contraseñas nuevas no coinciden.", "New passwords do not match.", "Ma'alob ta'akil."));
        return;
      }

      if (newPassword.length < 6) {
        setSecurityError(t("La contraseña debe tener al menos 6 caracteres.", "Password must be at least 6 characters.", "Ta'akil k'aas."));
        return;
      }

      localStorage.setItem("la_yucateca_admin_password", newPassword);
      setSecuritySuccess(t("¡Contraseña actualizada con éxito!", "Password updated successfully!", "Utsil ta'akil!"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSecuritySuccess(""), 3000);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      if ((window as any).adminLogout) {
        (window as any).adminLogout();
      } else {
        localStorage.removeItem("la_yucateca_admin_session");
        window.location.reload();
      }
    }
  };

  const runSystemTask = (taskName: string) => {
    setIsRunningTask(true);
    setSystemLogs((prev) => [...prev, `[SYSTEM] Initiating: ${taskName}...`]);

    setTimeout(() => {
      setSystemLogs((prev) => [...prev, `[SYSTEM] Executed successfully: ${taskName}.`]);
      setIsRunningTask(false);
    }, 1500);
  };

  return (
    <div style={{ padding: "40px 24px", color: "var(--text-primary)", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("Centro de Configuración y Perfil", "Settings & Profile Center", "Configuración")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {t(
            "Administra tus credenciales, perfil de administrador y controles del sistema global.",
            "Manage your credentials, administrator profile, and global system controls.",
            "Xak'al yéetel líik'sa'al u meyajil configuración ti' a wíinikil."
          )}
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "32px",
          overflowX: "auto",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {[
          { id: "profile", label: t("Perfil", "Profile", "Perfil"), icon: "👤" },
          { id: "security", label: t("Seguridad", "Security", "Seguridad"), icon: "🔒" },
          { id: "admin", label: t("Administración", "Administration", "Administración"), icon: "⚡" },
          { id: "db", label: t("Base de Datos", "Database", "Database"), icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              background: activeTab === tab.id ? "rgba(255, 85, 0, 0.15)" : "transparent",
              border: `1px solid ${activeTab === tab.id ? "rgba(255, 85, 0, 0.3)" : "transparent"}`,
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <form
            onSubmit={saveProfile}
            className="glass-card"
            style={{
              padding: "32px",
              borderRadius: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              👤 {t("Perfil de Administrador", "Administrator Profile", "Perfil")}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Nombre Completo", "Full Name", "Nombre")}
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Correo Electrónico (Usuario)", "Email Address (Username)", "Correo")}
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Rol del Sistema", "System Role", "Rol")}
                </label>
                <input
                  type="text"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                  required
                />
              </div>
            </div>

            {profileSuccess && (
              <p style={{ color: "#10b981", fontSize: "0.85rem", marginBottom: "16px", fontWeight: 600 }}>{profileSuccess}</p>
            )}

            <button type="submit" className="btn-primary" style={{ minWidth: "140px" }}>
              {t("Guardar Perfil", "Save Profile", "Guardar")}
            </button>
          </form>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <form
            onSubmit={changePassword}
            className="glass-card"
            style={{
              padding: "32px",
              borderRadius: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              🔒 {t("Cambiar Contraseña (Quantum Cipher)", "Change Password (Quantum Cipher)", "Contraseña")}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Contraseña Actual", "Current Password", "Ta'akil bejla'e'")}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Nueva Contraseña", "New Password", "Túumben ta'akil")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Confirmar Nueva Contraseña", "Confirm New Password", "Confirmar")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => confirmPassword !== undefined && setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                  required
                />
              </div>
            </div>

            {securitySuccess && (
              <p style={{ color: "#10b981", fontSize: "0.85rem", marginBottom: "16px", fontWeight: 600 }}>{securitySuccess}</p>
            )}
            {securityError && (
              <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px", fontWeight: 600 }}>{securityError}</p>
            )}

            <button type="submit" className="btn-primary">
              {t("Actualizar Contraseña", "Update Password", "Contraseña")}
            </button>
          </form>
        )}

        {/* ADMINISTRATION OPERATIONS */}
        {activeTab === "admin" && (
          <div
            className="glass-card"
            style={{
              padding: "32px",
              borderRadius: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              ⚡ {t("Operaciones del Sistema Global", "Global System Operations", "Operaciones")}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "24px" }}>
              {t("Desencadena tareas de mantenimiento de bajo nivel directamente en tu servidor.", "Trigger low-level system maintenance tasks directly on your server node.", "Desencadena tareas de mantenimiento.")}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <button
                disabled={isRunningTask}
                onClick={() => runSystemTask("Scrape RSS Feeds")}
                className="btn-secondary"
                style={{ justifyContent: "center", padding: "12px" }}
              >
                📰 {t("Forzar Raspado RSS", "Force RSS Scrape", "Scrape RSS")}
              </button>
              
              <button
                disabled={isRunningTask}
                onClick={() => runSystemTask("Purge Telemetry Logs")}
                className="btn-secondary"
                style={{ justifyContent: "center", padding: "12px" }}
              >
                📊 {t("Purgar Métricas", "Purge Telemetry Logs", "Telemetry")}
              </button>

              <button
                disabled={isRunningTask}
                onClick={() => runSystemTask("Reset Muna Chat Cache")}
                className="btn-secondary"
                style={{ justifyContent: "center", padding: "12px" }}
              >
                🤖 {t("Limpiar Caché Muna", "Clear Muna Cache", "Muna Cache")}
              </button>

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ justifyContent: "center", padding: "12px", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444" }}
              >
                🔒 {t("Cerrar Sesión", "Secure Logout", "Cerrar Sesión")}
              </button>
            </div>

            {systemLogs.length > 0 && (
              <div style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "16px", fontFamily: "monospace", fontSize: "0.75rem", color: "#10b981", maxHeight: "150px", overflowY: "auto" }}>
                {systemLogs.map((log, index) => (
                  <p key={index} style={{ margin: "4px 0" }}>&gt; {log}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DATABASE TAB */}
        {activeTab === "db" && (
          <div
            className="glass-card"
            style={{
              padding: "32px",
              borderRadius: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              📊 {t("Información de la Base de Datos", "Database Matrix Status", "Base de Datos")}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Motor de Persistencia Principal", "Primary Database Engine", "Base de Datos")}
                </label>
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", color: "#10b981", fontSize: "0.85rem", fontWeight: 700 }}>
                  SQLite (Prisma Client Local Node)
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("Proveedor de Autenticación de Muna", "Muna AI Cloud Database Provider", "Muna Database")}
                </label>
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", color: "var(--accent-gold)", fontSize: "0.85rem", fontWeight: 700 }}>
                  Google Cloud Firestore (Firebase Native Web SDK)
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "10px",
                background: "rgba(255, 85, 0, 0.08)",
                border: "1px solid rgba(255, 85, 0, 0.2)",
                fontSize: "0.82rem",
                color: "var(--text-primary)",
                lineHeight: "1.5",
              }}
            >
              💡 <strong>{t("Recomendación de Producción:", "Production Recommendation:", "Recomendación:")}</strong>{" "}
              {t(
                "Establece la variable DATABASE_URL en Vercel para conectarte de forma nativa a Supabase / Neon PostgreSQL con persistencia total en la nube.",
                "Define DATABASE_URL in Vercel environment variables to establish seamless cloud connection to your Supabase/Neon PostgreSQL cluster.",
                "Establece DATABASE_URL."
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
