"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";

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
  )
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty(
        "--current-sidebar-width",
        isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)"
      );
    }
  }, [isCollapsed]);

  return (
    <aside
      style={{
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
      }}
    >
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
            {!isCollapsed && (
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
            padding: isCollapsed ? "0 16px" : "0 24px",
          }}
        >
          {[
            { href: "/", label: t("Inicio", "Home", "Yáax"), icon: <Icons.Home /> },
            { href: "/news", label: t("Noticias", "News", "Péektsil"), icon: <Icons.News /> },
            { href: "/portfolio", label: t("Portafolio", "Portfolio", "Meyajo'ob"), icon: <Icons.Portfolio /> },
            { href: "/muna", label: t("Muna AI", "Muna AI", "Muna AI"), icon: <Icons.Ai /> },
            { href: "/contact", label: t("Contacto", "Contact", "Tsikbal"), icon: <Icons.Contact /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
                justifyContent: isCollapsed ? "center" : "flex-start",
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
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Humanese-style Circular Collapse/Expand Toggle Button */}
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

      {/* Bottom Section */}
      <div
        style={{
          padding: isCollapsed ? "0 16px" : "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {isCollapsed ? (
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
  );
}
