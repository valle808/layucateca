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
  const [waActiveTab, setWaActiveTab] = useState("connect");

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
        <div style={{ display: "flex", height: "100%", background: "#15191e", color: "#f8fafc", fontFamily: "Inter, -apple-system, sans-serif", overflow: "hidden", textAlign: "left" }}>
          {/* Sidebar */}
          <div style={{ width: "220px", background: "#1c2128", borderRight: "1px solid #2d333b", display: "flex", flexDirection: "column", padding: "24px 16px" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#94a3b8", marginBottom: "24px", paddingLeft: "12px" }}>Admin</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[
                { icon: "🏠", label: "Dashboard", active: false },
                { icon: "💬", label: "WhatsApp Studio", active: true },
                { icon: "👥", label: "Users", active: false },
                { icon: "⚙️", label: "Settings", active: false },
                { icon: "🏢", label: "Industries", active: false },
                { icon: "📊", label: "Reports", active: false },
                { icon: "🔗", label: "Link", active: false },
              ].map(menu => (
                <div key={menu.label} style={{
                  padding: "10px 12px", borderRadius: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "10px",
                  background: menu.active ? "rgba(37,211,102,0.15)" : "transparent",
                  color: menu.active ? "#25d366" : "#cbd5e1",
                  fontWeight: menu.active ? 600 : 400,
                  cursor: "pointer"
                }}>
                  <span style={{ fontSize: "1rem", opacity: menu.active ? 1 : 0.7 }}>{menu.icon}</span>
                  {menu.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#15191e", overflowY: "auto", position: "relative" }}>
            
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px 30px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", background: "#25d366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", color: "white", boxShadow: "0 0 20px rgba(37,211,102,0.4)" }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                </div>
                <h1 style={{ margin: 0, fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.5px" }}>WhatsApp Campaign Studio</h1>
              </div>
              <div 
                onClick={waInstanceStatus === "connected" ? disconnectWa : simulateQrScan}
                style={{ 
                  display: "inline-flex", alignItems: "center", gap: "8px", 
                  background: waInstanceStatus === "connected" ? "rgba(37,211,102,0.15)" : "rgba(37,211,102,0.05)", 
                  border: `1px solid ${waInstanceStatus === "connected" ? "#25d366" : "#25d36655"}`, 
                  padding: "8px 20px", borderRadius: "24px", cursor: "pointer",
                  transition: "all 0.3s",
                }}>
                <span style={{ 
                  width: "10px", height: "10px", borderRadius: "50%", 
                  background: waInstanceStatus === "connecting" ? "#f59e0b" : waInstanceStatus === "connected" ? "#25d366" : "#25d366",
                  boxShadow: waInstanceStatus === "connected" ? "0 0 10px #25d366" : "none",
                  animation: waInstanceStatus === "connecting" ? "pulse 1s infinite" : "none"
                }} />
                <span style={{ color: "#25d366", fontWeight: 600, fontSize: "0.95rem" }}>
                  {waInstanceStatus === "connected" ? "Connected" : waInstanceStatus === "connecting" ? "Connecting..." : "Disconnected"}
                </span>
              </div>
            </div>

            {/* Tab Bar */}
            <div style={{ display: "flex", borderBottom: "1px solid #2d333b", background: "#1c2128", padding: "0 20px", margin: "0 40px", borderRadius: "12px 12px 0 0" }}>
              {[
                { id: "connect", label: "📱 Connection" },
                { id: "contacts", label: "👥 Phonebook" },
                { id: "templates", label: "📄 Templates" },
                { id: "campaigns", label: "🚀 Campaigns" },
                { id: "history", label: "📊 History" }
              ].map(tab => (
                <div key={tab.id} onClick={() => setWaActiveTab(tab.id)} style={{
                  padding: "16px 24px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                  color: waActiveTab === tab.id ? "#25d366" : "#94a3b8",
                  borderBottom: waActiveTab === tab.id ? "2px solid #25d366" : "2px solid transparent",
                  transition: "all 0.2s"
                }}>
                  {tab.label}
                </div>
              ))}
            </div>

            {/* Tab Content Box */}
            <div style={{ flex: 1, background: "#1c2128", margin: "0 40px 40px", borderRadius: "0 0 12px 12px", padding: "40px", overflowY: "auto" }}>
              
              {waActiveTab === "connect" && (
                <>
                  <h2 style={{ margin: "0 0 32px", fontSize: "1.6rem", fontWeight: 700, color: "#f8fafc" }}>Connection</h2>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
                    
                    {/* Left Card: QR Code */}
                    <div style={{ background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <h3 style={{ margin: "0 0 16px", fontSize: "1.3rem", fontWeight: 600 }}>Link Your Device</h3>
                      <p style={{ color: "#94a3b8", textAlign: "center", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 32px" }}>
                        Open <strong>WhatsApp</strong> → <strong>Menu</strong> or <strong>Settings</strong> →<br/><strong>Linked Devices</strong> → <strong>Link a Device</strong>
                      </p>
                      
                      {waInstanceStatus === "connected" ? (
                        <div style={{ width: "240px", height: "240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                          <div style={{ fontSize: "5rem", color: "#25d366", filter: "drop-shadow(0 0 20px rgba(37,211,102,0.5))" }}>✓</div>
                          <p style={{ color: "#25d366", fontWeight: "bold", fontSize: "1.2rem", margin: 0 }}>Session Active</p>
                          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Phone is linked.</p>
                        </div>
                      ) : (
                        <>
                          <div 
                            onClick={simulateQrScan}
                            style={{ 
                              width: "240px", height: "240px", background: "#fff", padding: "16px", borderRadius: "16px", 
                              boxShadow: "0 0 0 4px rgba(37,211,102,0.4), 0 0 30px rgba(37,211,102,0.3)",
                              position: "relative", cursor: "pointer", overflow: "hidden"
                            }}
                            title="Click to simulate scanning"
                          >
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://layucateca.com/muna&color=1c2128" alt="QR" style={{ width: "100%", height: "100%" }} />
                            {waInstanceStatus === "connecting" && (
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: "50px", height: "50px", border: "5px solid #e2e8f0", borderTopColor: "#25d366", borderRadius: "50%", animation: "spin 1s infinite linear" }} />
                              </div>
                            )}
                            {waInstanceStatus === "disconnected" && (
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#25d366", boxShadow: "0 0 15px #25d366", animation: "waLaserSweep 2s infinite ease-in-out" }} />
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px", color: "#94a3b8", fontSize: "0.9rem" }}>
                            <span>⏱</span> QR expires in ~58 seconds <span style={{ width: "16px", height: "16px", border: "2px solid #94a3b8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s infinite linear", display: "inline-block" }} />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right Card: Instructions */}
                    <div style={{ background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column" }}>
                      <h3 style={{ margin: "0 0 24px", fontSize: "1.3rem", fontWeight: 600 }}>Connection Instructions</h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "0 0 32px" }}>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <div style={{ color: "#94a3b8" }}>1.</div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.5 }}>Ensure your phone is connected to the internet.</div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <div style={{ color: "#94a3b8" }}>2.</div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.5 }}>Tap the &quot;Link a Device&quot; button on your phone.</div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <div style={{ color: "#94a3b8" }}>3.</div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.5 }}>Point your phone&apos;s camera at this screen to scan the QR code.</div>
                        </div>
                      </div>

                      <div style={{ border: "1px solid #25d366", background: "transparent", borderRadius: "12px", padding: "20px", marginTop: "auto", boxShadow: "inset 0 0 20px rgba(37,211,102,0.05)" }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: "1.1rem", fontWeight: 600, color: "#f8fafc" }}>Privacy & Security</h4>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
                          Your connection is secure and end-to-end encrypted. We never store your personal messages or contacts on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {waActiveTab === "campaigns" && (
                <div>
                  <h2 style={{ margin: "0 0 24px", fontSize: "1.6rem", fontWeight: 700, color: "#f8fafc" }}>Campaign Execution</h2>
                  <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
                    <div style={{ background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px", padding: "24px" }}>
                      <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontSize: "0.9rem" }}>Message Template</label>
                      <textarea 
                        value={waComposeText} 
                        onChange={(e) => setWaComposeText(e.target.value)}
                        disabled={waSending}
                        style={{ width: "100%", background: "#1c2128", border: "1px solid #2d333b", borderRadius: "8px", padding: "16px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", resize: "none", minHeight: "120px", fontFamily: "inherit" }}
                      />
                      <button 
                        onClick={startWaCampaign}
                        disabled={waSending || waInstanceStatus !== "connected"}
                        style={{ 
                          marginTop: "20px", width: "100%", background: (waSending || waInstanceStatus !== "connected") ? "#2d333b" : "#25d366", 
                          color: (waSending || waInstanceStatus !== "connected") ? "#94a3b8" : "#1c2128", 
                          border: "none", borderRadius: "8px", padding: "16px", fontWeight: "bold", fontSize: "1rem", cursor: (waSending || waInstanceStatus !== "connected") ? "not-allowed" : "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {waSending ? "🚀 Sending in progress..." : "🚀 Launch Campaign"}
                      </button>
                    </div>

                    <div style={{ background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px", padding: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h4 style={{ margin: 0, color: "#f8fafc" }}>Live Terminal</h4>
                        <span style={{ color: "#25d366", fontWeight: "bold" }}>{waSentCount} / 3 Sent</span>
                      </div>
                      <div style={{ width: "100%", background: "#1c2128", height: "8px", borderRadius: "4px", marginBottom: "20px", overflow: "hidden" }}>
                        <div style={{ width: `${waProgress}%`, background: "#25d366", height: "100%", transition: "width 0.3s" }} />
                      </div>
                      <div style={{ background: "#0c1015", borderRadius: "8px", padding: "16px", height: "150px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.85rem", color: "#25d366", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {waLogs.map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {["contacts", "templates", "history"].includes(waActiveTab) && (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🚧</div>
                  <h3 style={{ color: "#f8fafc", fontSize: "1.4rem", margin: "0 0 12px" }}>Under Construction</h3>
                  <p>This tab is simulated in the live preview. Connect WhatsApp or use the Campaigns tab.</p>
                </div>
              )}

            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes waLaserSweep {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            @keyframes spin {
              100% { transform: rotate(360deg); }
            }
          `}} />
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
