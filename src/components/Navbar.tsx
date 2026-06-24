// Trusted-Source: Antigravity
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      id="main-nav"
      style={{
        position: "fixed",
        top: "var(--banner-height, 0px)",
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        padding: scrolled ? "10px 0" : "18px 0",
        background: scrolled
          ? "rgba(10, 10, 15, 0.88)"
          : "transparent",
        backdropFilter: scrolled ? "blur(25px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(212, 168, 83, 0.15)"
          : "none",
        boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #d4a853, #b8892a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "1.1rem",
              color: "#0a0a0f",
            }}
          >
            LY
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.2rem",
              background: "linear-gradient(135deg, #d4a853, #f0c97a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            La Yucateca
          </span>
        </Link>

        {/* Desktop Links */}
        <div
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {[
            { href: "/", label: t("Inicio", "Home", "Yáax") },
            { href: "/news", label: t("Noticias", "News", "Péektsil") },
            { href: "/portfolio", label: t("Portafolio", "Portfolio", "Meyajo'ob") },
            { href: "/muna", label: "Muna AI" },
            { href: "/contact", label: t("Contacto", "Contact", "Tsikbal") },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 16px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.9rem",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "var(--text-primary)";
                (e.target as HTMLElement).style.background =
                  "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "var(--text-secondary)";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Extended Language Switcher with Mayan Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              marginRight: "4px",
              marginLeft: "12px",
            }}
          >
            <button
              onClick={() => setLanguage("es")}
              style={{
                background: language === "es" ? "linear-gradient(135deg, #d4a853, #b8892a)" : "transparent",
                color: language === "es" ? "#0a0a0f" : "var(--text-secondary)",
                border: "none",
                borderRadius: "16px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              title="Español"
            >
              ES
            </button>
            <button
              onClick={() => setLanguage("en")}
              style={{
                background: language === "en" ? "linear-gradient(135deg, #d4a853, #b8892a)" : "transparent",
                color: language === "en" ? "#0a0a0f" : "var(--text-secondary)",
                border: "none",
                borderRadius: "16px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("my")}
              style={{
                background: language === "my" ? "linear-gradient(135deg, #d4a853, #b8892a)" : "transparent",
                color: language === "my" ? "#0a0a0f" : "var(--text-secondary)",
                border: "none",
                borderRadius: "16px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              title="Maya Yucateco"
            >
              MY
            </button>
          </div>

          {/* Dark / Light Theme Toggle — K'in (Sun) & Akbal (Night) */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Cambiar a K'in (Luz)" : "Cambiar a Akbal (Noche)"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-accent)",
              borderRadius: "20px",
              color: "var(--accent-gold)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginLeft: "6px",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,168,83,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            {theme === "dark" ? "☀️ K'in" : "🌑 Akbal"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "1.5rem",
            padding: "4px",
          }}
          className="mobile-menu-btn"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(10, 10, 15, 0.98)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border-subtle)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {[
            { href: "/", label: t("Inicio", "Home", "Yáax") },
            { href: "/news", label: t("Noticias", "News", "Péektsil") },
            { href: "/portfolio", label: t("Portafolio", "Portfolio", "Meyajo'ob") },
            { href: "/muna", label: "Muna AI" },
            { href: "/contact", label: t("Contacto", "Contact", "Tsikbal") },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px 16px",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontWeight: 500,
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Mobile Language Switches */}
          <div style={{ display: "flex", gap: "8px", padding: "12px 16px", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Lang:</span>
            <button onClick={() => { setLanguage("es"); setMenuOpen(false); }} style={{ color: language === "es" ? "var(--accent-gold)" : "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>ES</button>
            <button onClick={() => { setLanguage("en"); setMenuOpen(false); }} style={{ color: language === "en" ? "var(--accent-gold)" : "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>EN</button>
            <button onClick={() => { setLanguage("my"); setMenuOpen(false); }} style={{ color: language === "my" ? "var(--accent-gold)" : "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>MY</button>
          </div>

          {/* Mobile Theme Toggle — K'in / Akbal */}
          <div style={{ display: "flex", gap: "10px", padding: "12px 16px", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button
              onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMenuOpen(false); }}
              style={{ background: "none", border: "1px solid var(--border-accent)", borderRadius: "20px", cursor: "pointer", color: "var(--accent-gold)", padding: "6px 14px", fontWeight: 700, fontSize: "0.8rem" }}
            >
              {theme === "dark" ? "☀️ K'in" : "🌑 Akbal"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
