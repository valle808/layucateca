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
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Classroom: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
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
  const sidebarBase: React.CSSProperties = {
    position: "fixed",
    top: "var(--banner-height, 0px)",
    left: 0,
    bottom: 0,
    background: "var(--bg-card)",
    backdropFilter: "blur(40px) saturate(1.5)",
    WebkitBackdropFilter: "blur(40px) saturate(1.5)",
    borderRight: "1px solid var(--border-subtle)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "28px 0",
  };
  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        ...sidebarBase,
        width: "260px",
        zIndex: 1000,
        transition: "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: isOpen ? "translateX(0%)" : "translateX(-100%)",
      }
    : {
        ...sidebarBase,
        width: isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        zIndex: 100,
        transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
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
            top: "var(--banner-height, 0px)",
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
              padding: isCollapsed ? "0 14px" : "0 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              marginBottom: "36px",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#ff5500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(255,85,0,0.35)",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "-0.03em" }}>LA</span>
              </div>
              {(!isCollapsed || isMobile) && (
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
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
              gap: "4px",
              padding: isCollapsed && !isMobile ? "0 10px" : "0 14px",
            }}
          >
            {[
              { href: "/", label: t("Inicio", "Home", "Yáax"), icon: <Icons.Home /> },
              { href: "/news", label: t("Noticias", "News", "Péektsil"), icon: <Icons.News /> },
              { href: "/soluciones-digitales", label: t("Soluciones Digitales", "Digital Solutions", "Soluciones Digitales"), icon: <Icons.Solutions /> },
              { href: "/citizen-report", label: t("Denunciar", "Citizen Report", "Denunciar"), icon: <Icons.Report /> },
              { href: "/opinion-room", label: t("Chat Local", "Local Chat", "Chat Local"), icon: <Icons.Chat /> },
              { href: "/marketplace", label: t("Mercado", "Marketplace", "Mercado"), icon: <Icons.Market /> },
              { href: "/muna", label: t("Muna AI", "Muna AI", "Muna AI"), icon: <Icons.Ai /> },
              {
                href: user ? "#" : "/login",
                label: user ? `${user.name} (Salir)` : t("Ingresar", "Sign In", "Ingresar"),
                icon: <Icons.User />,
                action: user ? () => logout() : undefined,
              },
            ].map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false);
                    if (item.action) item.action();
                  }}
                  style={{
                    padding: isCollapsed && !isMobile ? "11px" : "10px 14px",
                    color: isActive ? "#ff5500" : "var(--text-secondary)",
                    textDecoration: "none",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.875rem",
                    borderRadius: "10px",
                    transition: "all 0.18s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    justifyContent: isCollapsed && !isMobile ? "center" : "flex-start",
                    background: isActive ? "rgba(255,85,0,0.09)" : "transparent",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {isActive && (
                    <span style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: "0 3px 3px 0",
                      background: "#ff5500",
                    }} />
                  )}
                  <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{item.icon}</span>
                  {(!isCollapsed || isMobile) && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
                </Link>
              );
            })}
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
            padding: isCollapsed && !isMobile ? "0 10px" : "0 14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {isCollapsed && !isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setLanguage(language === "es" ? "en" : language === "en" ? "my" : "es")}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#ff5500", color: "#fff",
                  border: "none", fontSize: "0.7rem", fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  letterSpacing: "0.06em", transition: "opacity 0.18s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                title="Change Language"
              >
                {language.toUpperCase()}
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "transparent", border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,85,0,0.09)";
                  (e.currentTarget as HTMLElement).style.color = "#ff5500";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
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
                  display: "flex", alignItems: "center",
                  padding: "4px", borderRadius: 11,
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(0,0,0,0.03)",
                  gap: 3,
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
                      background: language === lang.code ? "#ff5500" : "transparent",
                      color: language === lang.code ? "#fff" : "var(--text-secondary)",
                      border: "none", borderRadius: 8,
                      padding: "8px 0", fontSize: "0.72rem", fontWeight: 700,
                      letterSpacing: "0.08em", cursor: "pointer",
                      transition: "all 0.18s ease",
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
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 10, padding: "10px",
                  background: "transparent", borderRadius: 10,
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em",
                  cursor: "pointer", transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,85,0,0.09)";
                  (e.currentTarget as HTMLElement).style.color = "#ff5500";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,85,0,0.28)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                }}
              >
                {theme === "dark" ? <><Icons.ThemeDark /><span>Modo Akbal</span></> : <><Icons.ThemeLight /><span>Modo K'in</span></>}
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
