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

  // WhatsApp Automation Studio States & Logic
  const [waInstanceStatus, setWaInstanceStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected");
  const [waComposeText, setWaComposeText] = useState("Hola {name}, ¡este es un mensaje automático de La Yucateca! 🚀");
  const [waLogs, setWaLogs] = useState<string[]>([
    "[System] Core engine loaded.",
    "[Instance] Port 4880 bound successfully.",
    "[Instance] Awaiting connection..."
  ]);
  const [waSending, setWaSending] = useState(false);
  const [waSentCount, setWaSentCount] = useState(0);
  const [waProgress, setWaProgress] = useState(0);
  const [waPhoneMessages, setWaPhoneMessages] = useState<{ sender: "user" | "bot"; name: string; text: string; time: string }[]>([]);
  const [activeWaContact, setActiveWaContact] = useState<string>("Juan Canto");
  const [waUserPhone, setWaUserPhone] = useState("+52 (999) 456-7890");
  const [waUserName, setWaUserName] = useState("Mi Cuenta");
  const [showQrOptions, setShowQrOptions] = useState(false);

  const simulateQrScan = () => {
    if (waInstanceStatus !== "disconnected") return;
    setWaInstanceStatus("connecting");
    setWaLogs(prev => [...prev, "[Instance] Initializing QR handshake...", "[System] Fetching secure session credentials..."]);
    
    setTimeout(() => {
      setWaInstanceStatus("connected");
      setWaLogs(prev => [...prev, "[Instance] Secure session established!", `[Instance] Connected with ${waUserPhone} (${waUserName})`, "[System] Ready for campaign dispatch."]);
    }, 2000);
  };

  const disconnectWa = () => {
    setWaInstanceStatus("disconnected");
    setWaSentCount(0);
    setWaProgress(0);
    setWaPhoneMessages([]);
    setWaLogs(prev => [...prev, "[Instance] Session terminated.", "[Instance] Disconnected."]);
  };

  const startWaCampaign = () => {
    if (waSending) return;
    setWaSending(true);
    setWaSentCount(0);
    setWaProgress(0);
    setWaPhoneMessages([]);
    
    const contacts = [
      { name: "Juan Canto", phone: "+52 999 123 4567" },
      { name: "María Pech", phone: "+52 999 765 4321" },
      { name: "Andrés Tun", phone: "+52 999 555 4433" }
    ];
    
    setWaLogs(prev => [...prev, `[Campaign] Starting for ${contacts.length} recipients...`]);
    
    let index = 0;
    
    const sendNext = () => {
      if (index >= contacts.length) {
        setWaSending(false);
        setWaLogs(prev => [...prev, `[Campaign] Finished successfully. Sent: ${contacts.length}, Failed: 0`]);
        return;
      }
      
      const current = contacts[index];
      const personalized = waComposeText.replace("{name}", current.name);
      
      setActiveWaContact(current.name);
      setWaSentCount(index + 1);
      setWaProgress(((index + 1) / contacts.length) * 100);
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setWaPhoneMessages(prev => [...prev, { sender: "bot", name: current.name, text: personalized, time }]);
      
      setWaLogs(prev => [...prev, `[SUCCESS] Sent to ${current.name} (${current.phone})`]);
      
      index++;
      setTimeout(sendNext, 2500);
    };

    sendNext();
  };

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

    // 4. WHATSAPP AUTOMATION STUDIO MOCK VIEW
    if (item.slug === "whatsapp-automation-studio") {
      return (
        <div style={{ background: "#0b0e14", color: "#e9edef", minHeight: "100%", padding: "24px", fontFamily: "Segoe UI, -apple-system, sans-serif" }}>
          {/* Main Desktop Dashboard Simulation */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            
            {/* Left Controller Panel */}
            <div style={{ background: "#111b21", border: "1px solid #222e35", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222e35", paddingBottom: "15px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#00a884" }}>WhatsApp Automation</h3>
                  <span style={{ fontSize: "0.75rem", color: "#8696a0" }}>GUI Controller v1.2.0</span>
                </div>
                {waInstanceStatus === "connected" ? (
                  <button 
                    onClick={disconnectWa}
                    style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "12px", padding: "4px 10px", fontSize: "0.7rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <span>🛑</span> DISCONNECT
                  </button>
                ) : waInstanceStatus === "connecting" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(212,168,83,0.1)", padding: "4px 10px", borderRadius: "12px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#d4a853", fontWeight: "bold" }}>CONNECTING...</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.1)", padding: "4px 10px", borderRadius: "12px" }}>
                    <span style={{ width: "8px", height: "8px", background: "#f43f5e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #f43f5e" }}></span>
                    <span style={{ fontSize: "0.75rem", color: "#f43f5e", fontWeight: "bold" }}>DISCONNECTED</span>
                  </div>
                )}
              </div>

              {/* DISCONNECTED QR CODE VIEW */}
              {waInstanceStatus === "disconnected" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "10px 0", textAlign: "center" }}>
                  {!showQrOptions ? (
                    <>
                      <p style={{ fontSize: "0.85rem", color: "#8696a0", margin: 0, lineHeight: 1.5 }}>
                        Open WhatsApp on your phone &gt; Menu/Settings &gt; Linked Devices, and point your camera to this screen.
                      </p>
                      
                      {/* QR Code Container */}
                      <div 
                        onClick={() => setShowQrOptions(true)}
                        style={{ 
                          width: "160px", 
                          height: "160px", 
                          background: "#fff", 
                          padding: "8px", 
                          borderRadius: "12px", 
                          boxShadow: "0 8px 24px rgba(0,0,0,0.3)", 
                          cursor: "pointer", 
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        title="Click QR Code to Simulate Phone Scan"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://layucateca.com/muna&color=111b21" 
                          alt="WhatsApp Web QR Code" 
                          style={{ width: "100%", height: "100%", display: "block" }}
                        />
                        {/* Laser Sweeper Line */}
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "3px",
                          background: "#00a884",
                          boxShadow: "0 0 10px #00a884",
                          animation: "waLaserSweep 2s infinite ease-in-out"
                        }}></div>
                      </div>

                      <button 
                        onClick={() => setShowQrOptions(true)}
                        style={{ 
                          background: "linear-gradient(135deg, #00a884, #00ca9b)", 
                          color: "#111b21", 
                          border: "none", 
                          borderRadius: "8px", 
                          padding: "12px 20px", 
                          fontWeight: "bold", 
                          fontSize: "0.82rem", 
                          cursor: "pointer",
                          boxShadow: "0 4px 15px rgba(0,168,132,0.2)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span>📸</span> Link with QR Code
                      </button>
                    </>
                  ) : (
                    <div style={{ width: "100%", background: "#202c33", border: "1px solid #2a3942", borderRadius: "12px", padding: "16px", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#00a884", fontWeight: "bold" }}>Simular Escaneo QR</h4>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#8696a0", lineHeight: 1.4 }}>Ingresa tu información para personalizar la demostración interactiva:</p>
                      
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "#8696a0", marginBottom: "4px", textTransform: "uppercase" }}>Número de WhatsApp</label>
                        <input 
                          type="text" 
                          value={waUserPhone}
                          onChange={(e) => setWaUserPhone(e.target.value)}
                          placeholder="+52 999 123 4567"
                          style={{ width: "100%", background: "#111b21", border: "1px solid #2a3942", borderRadius: "6px", padding: "8px", color: "#fff", fontSize: "0.8rem", outline: "none" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "#8696a0", marginBottom: "4px", textTransform: "uppercase" }}>Nombre de Remitente</label>
                        <input 
                          type="text" 
                          value={waUserName}
                          onChange={(e) => setWaUserName(e.target.value)}
                          placeholder="Mi Cuenta"
                          style={{ width: "100%", background: "#111b21", border: "1px solid #2a3942", borderRadius: "6px", padding: "8px", color: "#fff", fontSize: "0.8rem", outline: "none" }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <button 
                          onClick={() => {
                            setShowQrOptions(false);
                            simulateQrScan();
                          }}
                          style={{ flex: 1, background: "linear-gradient(135deg, #00a884, #00ca9b)", color: "#111b21", border: "none", borderRadius: "6px", padding: "8px 12px", fontWeight: "bold", fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Conectar
                        </button>
                        <button 
                          onClick={() => setShowQrOptions(false)}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #2a3942", color: "#fff", borderRadius: "6px", padding: "8px 12px", fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CONNECTING HANDSHAKE VIEW */}
              {waInstanceStatus === "connecting" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "60px 10px", textAlign: "center" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid rgba(0,168,132,0.1)",
                    borderTop: "4px solid #00a884",
                    borderRadius: "50%",
                    animation: "waSpin 1s infinite linear"
                  }}></div>
                  <div>
                    <h4 style={{ margin: "0 0 6px", color: "#00a884", fontSize: "0.95rem", fontWeight: "bold" }}>Authenticating Session</h4>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#8696a0", lineHeight: 1.4 }}>Establishing end-to-end encrypted handshake with {waUserPhone}...</p>
                  </div>
                </div>
              )}

              {/* CONNECTED DASHBOARD CONTROLLER */}
              {waInstanceStatus === "connected" && (
                <>
                  {/* Message Input Box */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#8696a0", marginBottom: "8px" }}>
                      Message Template
                    </label>
                    <textarea 
                      value={waComposeText} 
                      onChange={(e) => setWaComposeText(e.target.value)}
                      disabled={waSending}
                      style={{ width: "100%", background: "#202c33", border: "1px solid #2a3942", borderRadius: "8px", padding: "12px", color: "#e9edef", fontSize: "0.85rem", outline: "none", resize: "none", minHeight: "100px", fontFamily: "inherit" }}
                      placeholder="Use {name} for variable injection..."
                    />
                    <span style={{ fontSize: "0.7rem", color: "#8696a0", marginTop: "4px", display: "block" }}>
                      Tip: Use <strong style={{ color: "#00a884" }}>{"{name}"}</strong> to automatically personalize each message!
                    </span>
                  </div>

                  {/* Target Contacts */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#8696a0", marginBottom: "8px" }}>
                      Recipient List (3 contacts loaded)
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {[
                        { name: "Juan Canto", phone: "+52 999 123 4567" },
                        { name: "María Pech", phone: "+52 999 765 4321" },
                        { name: "Andrés Tun", phone: "+52 999 555 4433" }
                      ].map((c) => (
                        <div 
                          key={c.name}
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            background: activeWaContact === c.name ? "rgba(0,168,132,0.15)" : "#202c33", 
                            border: activeWaContact === c.name ? "1px solid #00a884" : "1px solid #2a3942", 
                            borderRadius: "8px", 
                            padding: "8px 12px", 
                            fontSize: "0.8rem",
                            transition: "all 0.3s"
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                          <span style={{ color: "#8696a0" }}>{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button 
                      onClick={startWaCampaign}
                      disabled={waSending}
                      style={{ 
                        flex: 1, 
                        background: waSending ? "rgba(0,168,132,0.3)" : "linear-gradient(135deg, #00a884, #00ca9b)", 
                        color: "#111b21", 
                        border: "none", 
                        borderRadius: "8px", 
                        padding: "14px 20px", 
                        fontWeight: "bold", 
                        fontSize: "0.85rem", 
                        cursor: waSending ? "not-allowed" : "pointer", 
                        boxShadow: waSending ? "none" : "0 4px 15px rgba(0,168,132,0.3)", 
                        transition: "transform 0.2s" 
                      }}
                    >
                      {waSending ? "🚀 Executing Campaign..." : "🚀 Start Bulk Campaign"}
                    </button>
                  </div>
                </>
              )}

              {/* Console Logs */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#8696a0", marginBottom: "8px" }}>
                  Execution Terminal
                </label>
                <div style={{ background: "#0c1317", border: "1px solid #202c33", borderRadius: "8px", padding: "10px", height: "100px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.72rem", color: "#00e676", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {waLogs.slice(-6).map((log, index) => (
                    <div key={index} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Smartphone Simulator Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
              
              {/* Campaign Stats Card */}
              <div style={{ width: "100%", background: "#111b21", border: "1px solid #222e35", borderRadius: "16px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#8696a0", display: "block", textTransform: "uppercase" }}>Campaign Progress</span>
                  <strong style={{ fontSize: "1.5rem", color: "#00a884" }}>{waSentCount} / 3 Sent</strong>
                </div>
                <div style={{ width: "50%", background: "#202c33", height: "10px", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
                  <div style={{ width: `${waProgress}%`, background: "#00a884", height: "100%", borderRadius: "5px", transition: "width 0.5s ease" }}></div>
                </div>
              </div>

              {/* Smartphone mockup */}
              <div style={{ width: "280px", height: "450px", background: "#0b141a", border: "8px solid #222e35", borderRadius: "36px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", position: "relative" }}>
                
                {/* Phone Header */}
                <div style={{ background: "#202c33", padding: "12px", borderBottom: "1px solid #2a3942", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "30px", height: "30px", background: "#00a884", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem", color: "#111b21" }}>
                    {activeWaContact.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold", fontSize: "0.8rem", display: "block" }}>{activeWaContact}</span>
                    <span style={{ fontSize: "0.65rem", color: "#00e676" }}>online</span>
                  </div>
                </div>

                {/* Chat Stream (Simulated Messages) */}
                <div style={{ flex: 1, padding: "12px", backgroundImage: "radial-gradient(#1e2c34 1px, transparent 0)", backgroundSize: "16px 16px", backgroundPosition: "0 0", display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
                  {waPhoneMessages.length === 0 ? (
                    <div style={{ margin: "auto", textAlign: "center", color: "#8696a0", fontSize: "0.75rem", padding: "0 20px" }}>
                      Waiting to start bulk campaign...
                    </div>
                  ) : (
                    waPhoneMessages.map((m, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          alignSelf: "flex-end", 
                          background: "#005c4b", 
                          color: "#e9edef", 
                          borderRadius: "8px 8px 0 8px", 
                          padding: "8px 12px", 
                          fontSize: "0.78rem", 
                          maxWidth: "85%", 
                          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                          position: "relative"
                        }}
                      >
                        <div>{m.text}</div>
                        <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.6)", textAlign: "right", marginTop: "4px" }}>
                          {m.time} ✔✔
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input Bottom Mock */}
                <div style={{ background: "#202c33", padding: "8px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ flex: 1, background: "#2a3942", borderRadius: "16px", padding: "6px 12px", fontSize: "0.7rem", color: "#8696a0" }}>
                    Escribe un mensaje...
                  </div>
                  <span style={{ fontSize: "1.2rem" }}>🎙️</span>
                </div>

              </div>
            </div>

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
          <button style={{ background: "linear-gradient(135deg, #d4a853, #b8892a)", color: "#0a0a0f", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "default" }}>
            ✓ {t("Demostración Activa", "Interactive Demo")}
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
      <header className="showcase-header">
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
