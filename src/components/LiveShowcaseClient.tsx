// Trusted-Source: Antigravity
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  price: number | null;
}

interface LiveShowcaseClientProps {
  item: PortfolioItem;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function LiveShowcaseClient({ item }: LiveShowcaseClientProps) {
  const { t, translateDb } = useLanguage();
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  // Define width configurations for simulated devices
  const getDeviceWidth = () => {
    switch (device) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  const getDeviceHeight = () => {
    return device === "desktop" ? "calc(100vh - 70px)" : "720px";
  };

  const renderMockPreview = () => {
    const titleText = translateDb(item.title);
    
    // 1. SOLSTICE LUXURY E-COMMERCE MOCK VIEW
    if (item.slug === "solstice-luxury-ecommerce-landing") {
      return (
        <div style={{ background: "#060608", color: "#f8f5f0", minHeight: "100%", padding: "40px 24px", fontFamily: "'Playfair Display', serif" }}>
          {/* Mock E-commerce Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(212,168,83,0.2)", paddingBottom: "20px", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "1.5rem", letterSpacing: "3px", color: "#d4a853" }}>SOLSTICE</h2>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setCartOpen(!cartOpen)}>
              <span style={{ fontSize: "1.5rem" }}>👜</span>
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: "-5px", right: "-8px", background: "#d4a853", color: "#060608", borderRadius: "50%", width: "18px", height: "18px", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {cartCount}
                </span>
              )}
            </div>
          </div>

          {/* Hero Showcase */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", alignItems: "center" }}>
            <div>
              <span style={{ color: "#d4a853", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "2px" }}>Collection Royale</span>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "normal", margin: "10px 0 20px", lineHeight: 1.2 }}>Solstice Gold Bracelet</h1>
              <p style={{ color: "#a09e9a", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "30px" }}>
                Handcrafted 24k gold bracelet with micro-pave diamond embellishments. An expression of pure celestial alignment.
              </p>
              <p style={{ fontSize: "1.8rem", color: "#d4a853", fontWeight: "bold", marginBottom: "20px" }}>$4,800 USD</p>
              <button 
                onClick={() => {
                  setCartCount(prev => prev + 1);
                  setCartOpen(true);
                }}
                style={{ background: "linear-gradient(135deg, #d4a853, #b8892a)", color: "#060608", border: "none", padding: "14px 28px", fontSize: "0.9rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "transform 0.2s" }}
              >
                Agregar al Carrito
              </button>
            </div>
            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(212,168,83,0.3)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" alt="luxury wristwatch" style={{ width: "100%", display: "block" }} />
            </div>
          </div>

          {/* Side Cart Drawer */}
          {cartOpen && (
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "300px", background: "#0a0a0f", borderLeft: "1px solid rgba(212,168,83,0.25)", padding: "30px 20px", zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                  <h3 style={{ margin: 0, color: "#d4a853" }}>Tu Bolsa</h3>
                  <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#f8f5f0", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                </div>
                {cartCount === 0 ? (
                  <p style={{ color: "#a09e9a", textAlign: "center", marginTop: "40px" }}>Tu bolsa está vacía.</p>
                ) : (
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "6px" }}>
                    <div style={{ width: "50px", height: "50px", background: "#222", borderRadius: "4px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: "bold" }}>Solstice Gold Bracelet</p>
                      <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#d4a853" }}>$4,800 x {cartCount}</p>
                    </div>
                  </div>
                )}
              </div>
              {cartCount > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "15px", marginBottom: "20px" }}>
                    <span>Subtotal:</span>
                    <span style={{ color: "#d4a853", fontWeight: "bold" }}>${(4800 * cartCount).toLocaleString()} USD</span>
                  </div>
                  <button style={{ width: "100%", background: "#d4a853", color: "#060608", border: "none", padding: "12px", fontWeight: "bold", textTransform: "uppercase", cursor: "pointer" }}>Proceder al Pago</button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // 2. AURA CREATIVE AGENCY MOCK VIEW
    if (item.slug === "aura-creative-agency-portfolio") {
      return (
        <div style={{ background: "#0a0a0f", color: "#fff", minHeight: "100%", padding: "60px 40px", fontFamily: "sans-serif" }}>
          <span style={{ color: "#2dd4bf", fontSize: "0.8rem", letterSpacing: "3px", textTransform: "uppercase" }}>Visual Architecture</span>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-1px", margin: "16px 0 30px", lineHeight: 1.05 }}>WE SHAPE DIGITAL BLUR.</h1>
          <p style={{ color: "#a0a5b5", maxWidth: "580px", lineHeight: 1.8, fontSize: "1.05rem", marginBottom: "40px" }}>
            Aura is a digital design studio orchestrating high-end web experiences for gamechangers, innovators, and luxury brands worldwide.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {["Monolith Branding", "Ethereal UI Engine", "Quantum Art Direction"].map((title, i) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "30px", transition: "transform 0.2s", cursor: "pointer" }}>
                <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "15px" }}>0{i+1}.</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>{title}</h3>
                <p style={{ color: "#a0a5b5", fontSize: "0.85rem", lineHeight: 1.5 }}>Crafting immersive spaces that transcend browser boundaries.</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. VERTEX DEVELOPER PORTFOLIO MOCK VIEW
    if (item.slug === "vertex-developer-portfolio-tech-blog") {
      return (
        <div style={{ background: "#09090b", color: "#22c55e", minHeight: "100%", padding: "40px", fontFamily: "monospace" }}>
          <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: "15px", marginBottom: "30px" }}>
            <span style={{ color: "#fff", fontWeight: "bold" }}>vertex@shell:~</span>$ cat intro.sh
          </div>
          <h1 style={{ color: "#fff", fontSize: "2rem", marginBottom: "15px" }}>&gt;_ Creative Software Architect</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "30px" }}>
            I design reliable cloud backends, secure smart contract architectures, and super-fast localized Next.js portals.
          </p>
          <div style={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "6px", padding: "20px", color: "#38bdf8" }}>
            <p style={{ margin: 0 }}><span style={{ color: "#ec4899" }}>const</span> skills = [</p>
            <p style={{ margin: "4px 0 4px 20px" }}>&quot;Next.js&quot;, &quot;Prisma SQLite&quot;, &quot;Mayan Localization&quot;, &quot;Quantum Shield&quot;</p>
            <p style={{ margin: 0 }}>];</p>
          </div>
        </div>
      );
    }

    // FALLBACK STANDARD INTERACTIVE MOCK SHOWCASE
    return (
      <div style={{ background: "var(--bg-secondary)", minHeight: "100%", padding: "60px 40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <span style={{ fontSize: "4rem", marginBottom: "20px" }}>🌐</span>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{titleText}</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "580px", margin: "16px 0 30px", lineHeight: 1.7 }}>
          {translateDb(item.description)}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ background: "linear-gradient(135deg, #d4a853, #b8892a)", color: "#0a0a0f", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold" }}>
            {t("Demostración Activa", "Interactive Demo")}
          </button>
          <Link href="/contact" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", color: "#fff", fontWeight: "bold" }}>
            {t("Adquirir Ahora", "Acquire Theme")}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Device Controller Top Bar */}
      <header
        style={{
          height: "70px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href={`/portfolio/${item.slug}`}
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← {t("Volver a Detalles", "Back to Details")}
          </Link>
          <span style={{ color: "var(--border-subtle)" }}>|</span>
          <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{translateDb(item.title).split(" || ")[0]}</span>
        </div>

        {/* View mode buttons */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", borderRadius: "24px", padding: "4px" }}>
          {[
            { mode: "desktop" as DeviceMode, label: "🖥️ Desktop" },
            { mode: "tablet" as DeviceMode, label: "📱 Tablet" },
            { mode: "mobile" as DeviceMode, label: "📞 Mobile" },
          ].map((modeItem) => (
            <button
              key={modeItem.mode}
              onClick={() => setDevice(modeItem.mode)}
              style={{
                background: device === modeItem.mode ? "linear-gradient(135deg, #d4a853, #b8892a)" : "transparent",
                color: device === modeItem.mode ? "#0a0a0f" : "var(--text-secondary)",
                border: "none",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {modeItem.label}
            </button>
          ))}
        </div>

        {/* Call to action */}
        <div>
          <Link href="/contact" className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.8rem" }}>
            {t("Adquirir por", "Get for")} ${item.price?.toLocaleString()} USD
          </Link>
        </div>
      </header>

      {/* Responsive Frame Container */}
      <main style={{ flex: 1, padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.4)" }}>
        <div
          style={{
            width: getDeviceWidth(),
            height: getDeviceHeight(),
            background: "#0d0d12",
            border: "1px solid var(--border-accent)",
            borderRadius: device === "desktop" ? "0" : "24px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            overflow: "hidden",
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            position: "relative",
          }}
        >
          {device !== "desktop" && (
            <div style={{ height: "30px", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: "40px", height: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "3px" }} />
            </div>
          )}
          <div style={{ height: device === "desktop" ? "100%" : "calc(100% - 30px)", overflowY: "auto" }}>
            {renderMockPreview()}
          </div>
        </div>
      </main>
    </div>
  );
}
