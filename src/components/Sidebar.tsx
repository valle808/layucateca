"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

const Icons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  News: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="3" y="4" width="18" height="16" rx="0"></rect>
      <line x1="8" y1="8" x2="16" y2="8"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
      <line x1="8" y1="16" x2="12" y2="16"></line>
    </svg>
  ),
  Portfolio: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="2" y="3" width="20" height="14" rx="0"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  Contact: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Collapse: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  Expand: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  ThemeDark: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  ThemeLight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),
  Ai: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Solutions: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  ),
  Report: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Market: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  ),
  Marketing: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  AdminDashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  Agents: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  Tasks: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="23 4 12 15 7 10"></polyline>
      <polyline points="17 21 12 16 7 21"></polyline>
    </svg>
  ),
  Skills: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  )
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(pathname === "/muna");
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("la_yucateca_admin_session");
      setIsAdmin(token === "quantum_shield_valle_808_active");
    }
  }, [user, pathname]);

  useEffect(() => {
    if (pathname === "/muna") {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        document.documentElement.style.setProperty("--current-sidebar-width", "0px");
      } else {
        document.documentElement.style.setProperty(
          "--current-sidebar-width",
          isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)"
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  // Sidebar styling for desktop vs mobile drawer
  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "280px",
        background: "var(--bg-card)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRight: "1px solid var(--border-subtle)",
        zIndex: 1000,
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isOpen ? "translateX(0%)" : "translateX(-100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 0",
      }
    : {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        background: "var(--bg-card)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        borderRight: "1px solid var(--border-subtle)",
        zIndex: 100,
        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 0",
      };

  return (
    <>
      {/* 1. Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 999,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* 2. Sticky Mobile Header */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "64px",
            background: "var(--bg-card)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            zIndex: 900,
          }}
        >
          {/* Hamburger toggle button */}
          <button
            onClick={() => setIsOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Logo center */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              La Yucateca
            </span>
          </Link>

          {/* Dark Mode toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {theme === "dark" ? <Icons.ThemeDark /> : <Icons.ThemeLight />}
          </button>
        </div>
      )}

      {/* 3. Aside Sidebar Drawer */}
      <aside style={sidebarStyle}>
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: "24px",
              right: "20px",
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "1.3rem",
              zIndex: 1010,
            }}
          >
            ✕
          </button>
        )}

        {/* Top Section */}
        <div>
          <div
            style={{
              padding: isCollapsed ? "0 20px" : "0 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              marginBottom: "48px",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-primary)",
                  flexShrink: 0,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                </svg>
              </div>
              {(!isCollapsed || isMobile) && (
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--text-primary)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  La Yucateca
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: isCollapsed && !isMobile ? "0 16px" : "0 24px",
            }}
          >
            {(() => {
              const items: Array<{ href: string; label: string; icon: React.ReactNode; action?: () => void }> = [
                { href: "/", label: t("Inicio", "Home", "Yáax"), icon: <Icons.Home /> },
                { href: "/news", label: t("Noticias", "News", "Péektsil"), icon: <Icons.News /> },
                { href: "/soluciones-digitales", label: t("Soluciones Digitales", "Digital Solutions", "Nu'ukulo'ob Digitales"), icon: <Icons.Solutions /> },
                { href: "/citizen-report", label: t("Denunciar", "Citizen Report", "T'aan"), icon: <Icons.Report /> },
                { href: "/opinion-room", label: t("Chat Local", "Local Chat", "Tsikbal"), icon: <Icons.Chat /> },
                { href: "/marketplace", label: t("Mercado", "Marketplace", "K'íiwic"), icon: <Icons.Market /> },
                { href: "/muna", label: t("Muna AI", "Muna AI", "Muna AI"), icon: <Icons.Ai /> },
              ];

              if (isAdmin) {
                items.push(
                  { href: "/admin", label: t("Panel Admin", "Admin Panel", "Panel Admin"), icon: <Icons.AdminDashboard /> },
                  { href: "/admin/agents", label: t("Agentes", "Agents", "Ajwáantajob"), icon: <Icons.Agents /> },
                  { href: "/admin/tasks", label: t("Tareas", "Tasks", "Meyajil"), icon: <Icons.Tasks /> },
                  { href: "/admin/skills", label: t("Habilidades", "Skills", "Habilidades"), icon: <Icons.Skills /> }
                );
              }

              items.push({
                href: user ? "#" : "/login",
                label: user ? `${user.name} (Salir)` : t("Ingresar", "Sign In", "Okol"),
                icon: <Icons.User />,
                action: user ? () => logout() : undefined,
              });

              return items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false);
                    if (item.action) {
                      item.action();
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "0.85rem",
                    letterSpacing: "0.05em",
                    border: "1px solid transparent",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    justifyContent: isCollapsed && !isMobile ? "center" : "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-subtle)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.border = "1px solid transparent";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                  {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              ));
            })()}
          </nav>
        </div>

        {/* Humanese-style Circular Collapse/Expand Toggle Button (Hide on Mobile) */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              position: "absolute",
              top: "34px",
              right: "-14px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 110,
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.1)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
            title={isCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? <polyline points="9 18 15 12 9 6"></polyline> : <polyline points="15 18 9 12 15 6"></polyline>}
            </svg>
          </button>
        )}

        {/* Bottom Section */}
        <div
          style={{
            padding: isCollapsed && !isMobile ? "0 16px" : "0 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {isCollapsed && !isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
              {/* Compact Language button */}
              <button
                onClick={() => setLanguage(language === "es" ? "en" : language === "en" ? "my" : "es")}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "var(--text-primary)",
                  color: "var(--bg-primary)",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                title="Change Language"
              >
                {language.toUpperCase()}
              </button>
              {/* Compact Theme button */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                title="Toggle Theme"
              >
                {theme === "dark" ? <Icons.ThemeDark /> : <Icons.ThemeLight />}
              </button>
            </div>
          ) : (
            <>
              {/* Language Switcher */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-primary)",
                }}
              >
                {[
                  { code: "es", label: "ES" },
                  { code: "en", label: "EN" },
                  { code: "my", label: "MY" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as "es" | "en" | "my")}
                    style={{
                      flex: 1,
                      background: language === lang.code ? "var(--text-primary)" : "transparent",
                      color: language === lang.code ? "var(--bg-primary)" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 0",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Theme Switcher */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "transparent",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {theme === "dark" ? (
                  <>
                    <Icons.ThemeDark />
                    <span>Akbal</span>
                  </>
                ) : (
                  <>
                    <Icons.ThemeLight />
                    <span>K'in</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
