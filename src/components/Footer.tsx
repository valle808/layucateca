"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "60px 24px 32px",
        marginTop: "80px",
        background: "var(--bg-secondary)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Minimal geometric divider */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "48px",
            opacity: 0.35,
            color: "#ffffff",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
            <rect x="3" y="3" width="18" height="18" rx="0"></rect>
          </svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
            <polygon points="12 2 22 22 2 22 12 2"></polygon>
          </svg>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "48px",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                </svg>
              </div>
              <span style={{ fontWeight: 500, fontSize: "1.1rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff" }}>
                La Yucateca
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "250px" }}>
              {t(
                "Tu fuente principal de noticias y soluciones profesionales de diseño web.",
                "Your premier source for news and professional web design solutions.",
                "A yáax pa'ak'al ti'al péektsil yéetel meyajo'ob ti' pat jo'ol web."
              )}
            </p>
          </div>

          {/* Enlaces / Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontWeight: 600, marginBottom: "16px", fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {t("Enlaces", "Links", "Nu'ukbesaj")}
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Inicio", "Home")}
                </Link>
              </li>
              <li>
                <Link href="/news" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Noticias", "News")}
                </Link>
              </li>
              <li>
                <Link href="/soluciones-digitales" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Soluciones Digitales", "Digital Solutions")}
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Acerca de", "About Us", "Tu yóolal")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: "#ffffff", fontWeight: 600, marginBottom: "16px", fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Legal
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Privacidad", "Privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Términos", "Terms")}
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Contacto", "Contact")}
                </Link>
              </li>
              <li>
                <Link href="/impressum" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>
                  {t("Aviso Legal / Impressum", "Impressum")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            © {new Date().getFullYear()} La Yucateca. {t("Todos los derechos reservados.", "All rights reserved.")}
          </p>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
              <rect x="2" y="2" width="20" height="20" rx="0"></rect>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="12" y1="2" x2="12" y2="22"></line>
            </svg>
            <span>Powered by OMEGA Node</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
