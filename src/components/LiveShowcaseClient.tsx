// Trusted-Source: Antigravity
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

type WaStatus = "disconnected" | "connecting" | "connected" | "qr";

interface WaState {
  status: WaStatus;
  qrBase64: string | null;
  phone: string | null;
  name: string | null;
  contactCount: number;
  groupCount: number;
  error: string | null;
}

interface Contact {
  id: string;
  jid: string;
  name: string | null;
  notify: string | null;
  phone: string | null;
  isGroup: boolean;
  tags: string;
  notes: string | null;
  blocked: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string | null;
  content: string;
  footer: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  donationUrl: string | null;
  variables: string;
  buttons: string;
  isDefault: boolean;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  sentCount: number;
  failedCount: number;
  totalCount: number;
  recipients: string;
  createdAt: string;
  template?: { name: string; category: string } | null;
}

const SERVICE_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_URL || "https://wa.layucateca.com";

const TEMPLATE_CATEGORIES = [
  { id: "invitation", label: "🎉 Invitation", color: "#8b5cf6" },
  { id: "donation", label: "💰 Donation", color: "#10b981" },
  { id: "alert", label: "🚨 Alert / Emergency", color: "#ef4444" },
  { id: "news", label: "📰 News", color: "#3b82f6" },
  { id: "announcement", label: "📢 Announcement", color: "#f59e0b" },
  { id: "event", label: "🗓️ Event", color: "#ec4899" },
  { id: "promotion", label: "🛍️ Promotion / Offer", color: "#06b6d4" },
  { id: "survey", label: "📊 Survey / Poll", color: "#a855f7" },
  { id: "thankyou", label: "🙏 Thank You", color: "#84cc16" },
  { id: "reminder", label: "⏰ Reminder", color: "#fb923c" },
  { id: "political", label: "🏛️ Political Campaign", color: "#6366f1" },
  { id: "message", label: "💬 General Message", color: "#64748b" },
];

const STATUS_COLORS: Record<WaStatus, string> = {
  disconnected: "#ef4444",
  connecting: "#f59e0b",
  qr: "#8b5cf6",
  connected: "#22c55e",
};

const STATUS_LABELS: Record<WaStatus, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting…",
  qr: "Scan QR Code",
  connected: "Connected",
};

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  DRAFT: "#64748b",
  RUNNING: "#f59e0b",
  COMPLETED: "#22c55e",
  FAILED: "#ef4444",
  SCHEDULED: "#3b82f6",
};

const CAMPAIGN_STATUS_ICONS: Record<string, string> = {
  DRAFT: "📋",
  RUNNING: "⏳",
  COMPLETED: "✅",
  FAILED: "❌",
  SCHEDULED: "🗓️",
};

export default function LiveShowcaseClient({ item }: LiveShowcaseClientProps) {
  const { t, translateDb } = useLanguage();
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  // Real WhatsApp Campaign Studio showcase state
  const [waActiveTab, setWaActiveTab] = useState("connect");
  const [waState, setWaState] = useState<WaState>({
    status: "disconnected",
    qrBase64: null,
    phone: null,
    name: null,
    contactCount: 0,
    groupCount: 0,
    error: null,
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE connection for showcase
  useEffect(() => {
    if (item.slug !== "whatsapp-automation-studio") return;

    const es = new EventSource(`${SERVICE_URL}/events`);
    eventSourceRef.current = es;

    es.addEventListener("state", (e) => {
      const data = JSON.parse(e.data);
      setWaState({
        status: data.status,
        qrBase64: data.qrBase64,
        phone: data.phone,
        name: data.name,
        contactCount: data.contacts?.length ?? 0,
        groupCount: data.groups?.length ?? 0,
        error: data.error,
      });
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [item.slug]);

  // Sync subtab to URL
  useEffect(() => {
    if (item.slug === "whatsapp-automation-studio" && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const subtab = params.get("subtab");
      const validSubtabs = ["connect", "contacts", "templates", "campaigns", "history"];
      if (subtab && validSubtabs.includes(subtab)) {
        setWaActiveTab(subtab);
      }
    }
  }, [item.slug]);

  const handleWaTabChange = (tab: string) => {
    setWaActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("subtab", tab);
      window.history.pushState(null, "", url.toString());
    }
  };

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/whatsapp/contacts");
    if (res.ok) setContacts(await res.json());
  }, []);

  const fetchTemplates = useCallback(async () => {
    const res = await fetch("/api/whatsapp/templates");
    if (res.ok) setTemplates(await res.json());
  }, []);

  const fetchCampaigns = useCallback(async () => {
    const res = await fetch("/api/whatsapp/campaigns");
    if (res.ok) setCampaigns(await res.json());
  }, []);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (item.slug === "whatsapp-automation-studio") {
      fetchContacts();
      fetchTemplates();
      fetchCampaigns();
    }
  }, [item.slug, fetchContacts, fetchTemplates, fetchCampaigns]);

  const handleConnect = async () => {
    await fetch(`${SERVICE_URL}/connect`, { method: "POST" });
  };

  const handleDisconnect = async () => {
    await fetch(`${SERVICE_URL}/disconnect`, { method: "POST" });
    notify("Disconnected from WhatsApp");
  };

  const handleSyncContacts = async () => {
    const res = await fetch("/api/whatsapp/contacts", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      notify(`✅ Synced ${data.saved} contacts to phonebook`);
      fetchContacts();
    } else {
      notify("Failed to sync contacts", "error");
    }
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
                style={{ 
                  display: "inline-flex", alignItems: "center", gap: "8px", 
                  background: `${STATUS_COLORS[waState.status]}22`,
                  border: `1px solid ${STATUS_COLORS[waState.status]}44`, 
                  padding: "8px 20px", borderRadius: "24px",
                  transition: "all 0.3s",
                }}>
                <span style={{ 
                  width: "10px", height: "10px", borderRadius: "50%", 
                  background: STATUS_COLORS[waState.status],
                  boxShadow: waState.status === "connected" ? `0 0 10px ${STATUS_COLORS[waState.status]}` : "none",
                  animation: waState.status === "connecting" ? "pulse 1s infinite" : "none"
                }} />
                <span style={{ color: STATUS_COLORS[waState.status], fontWeight: 600, fontSize: "0.95rem" }}>
                  {STATUS_LABELS[waState.status]}
                </span>
                {waState.phone && (
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem", marginLeft: "4px" }}>
                    +{waState.phone}
                  </span>
                )}
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
                <div key={tab.id} onClick={() => handleWaTabChange(tab.id)} style={{
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
                <ConnectTab
                  waState={waState}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              )}

              {waActiveTab === "contacts" && (
                <ContactsTab
                  contacts={contacts}
                  waStatus={waState.status}
                  onSync={handleSyncContacts}
                  onRefresh={fetchContacts}
                  onNotify={notify}
                />
              )}

              {waActiveTab === "templates" && (
                <TemplatesTab
                  templates={templates}
                  onRefresh={fetchTemplates}
                  onNotify={notify}
                />
              )}

              {waActiveTab === "campaigns" && (
                <CampaignsTab
                  contacts={contacts}
                  templates={templates}
                  waStatus={waState.status}
                  onRefresh={fetchCampaigns}
                  onNotify={notify}
                />
              )}

              {waActiveTab === "history" && (
                <HistoryTab
                  campaigns={campaigns}
                  onRefresh={fetchCampaigns}
                />
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
            @keyframes pulse {
              0% { transform: scale(0.9); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(0.9); opacity: 0.8; }
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
      {/* Notification toast */}
      {notification && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          padding: "14px 20px", borderRadius: 12,
          background: notification.type === "success" ? "#0f5132" : "#5c1515",
          border: `1px solid ${notification.type === "success" ? "#22c55e33" : "#ef444433"}`,
          color: notification.type === "success" ? "#86efac" : "#fca5a5",
          fontWeight: 600, fontSize: "0.9rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "fadeInUp 0.3s ease",
        }}>
          {notification.msg}
        </div>
      )}

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

// ──────────────────────────────────────────────────────────────────────────────
// Connect Tab Component
// ──────────────────────────────────────────────────────────────────────────────
function ConnectTab({
  waState,
  onConnect,
  onDisconnect,
}: {
  waState: WaState;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
      {/* QR / Status card */}
      <div className="card" style={{ padding: 32, background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 24, color: "#f8fafc" }}>
          📱 WhatsApp Connection
        </h2>

        {waState.status === "disconnected" && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>📵</div>
            <p style={{ color: "#94a3b8", marginBottom: 24 }}>
              Connect your WhatsApp to start sending campaigns
            </p>
            <button
              onClick={onConnect}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                border: "none", borderRadius: 12, color: "#fff",
                fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
              }}
            >
              🔗 Connect WhatsApp
            </button>
          </div>
        )}

        {waState.status === "connecting" && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⚙️</div>
            <p style={{ color: "#94a3b8" }}>Initializing connection…</p>
          </div>
        )}

        {waState.status === "qr" && waState.qrBase64 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#94a3b8", marginBottom: 16, fontSize: "0.9rem" }}>
              Open WhatsApp → ⋮ Menu → Linked Devices → Link a Device
            </p>
            <div style={{
              display: "inline-block", padding: 16,
              background: "#fff", borderRadius: 16,
              boxShadow: "0 0 0 4px rgba(37,211,102,0.2), 0 8px 40px rgba(37,211,102,0.2)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={waState.qrBase64}
                alt="WhatsApp QR Code"
                style={{ width: 240, height: 240, display: "block" }}
              />
            </div>
            <p style={{ marginTop: 16, color: "#25d366", fontWeight: 600, fontSize: "0.85rem" }}>
              ⏱ QR expires in ~60 seconds. It refreshes automatically.
            </p>
          </div>
        )}

        {waState.status === "connected" && (
          <div style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #25d366, #128c7e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem", margin: "0 auto 20px",
              boxShadow: "0 4px 30px rgba(37,211,102,0.5)",
              color: "#fff"
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#25d366", marginBottom: 8 }}>
              Connected!
            </h3>
            {waState.name && (
              <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 4, color: "#f8fafc" }}>{waState.name}</p>
            )}
            {waState.phone && (
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 24 }}>
                +{waState.phone}
              </p>
            )}
            <button
              onClick={onDisconnect}
              style={{
                padding: "10px 24px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8, color: "#f87171",
                fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              🔌 Disconnect
            </button>
          </div>
        )}

        {waState.error && (
          <div style={{
            marginTop: 16, padding: "10px 14px", borderRadius: 8,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5", fontSize: "0.85rem",
          }}>
            ⚠️ {waState.error}
          </div>
        )}
      </div>

      {/* Instructions card */}
      <div className="card" style={{ padding: 32, background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20, color: "#f8fafc" }}>
          📖 How to Connect
        </h2>
        <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.9 }}>
          {[
            'Click "Connect WhatsApp" to generate a QR code',
            'Open WhatsApp on your phone',
            'Go to Menu (⋮) → Linked Devices',
            'Tap "Link a Device"',
            'Point your camera at the QR code',
            'Wait for the connection to establish',
            'Once connected, sync your contacts to the phonebook',
          ].map((step, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <strong style={{ color: "#25d366" }}>{i + 1}.</strong> {step}
            </li>
          ))}
        </ol>

        <div style={{
          marginTop: 24, padding: "16px", borderRadius: 12,
          background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)",
        }}>
          <p style={{ fontWeight: 700, color: "#25d366", marginBottom: 8 }}>🔒 Privacy & Security</p>
          <ul style={{ paddingLeft: 20, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.8 }}>
            <li>Session stored securely on server</li>
            <li>Phonebook is private (never public)</li>
            <li>All messages sent via official WhatsApp Web protocol</li>
            <li>Respect recipients — avoid spam</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Contacts Tab Component
// ──────────────────────────────────────────────────────────────────────────────
function ContactsTab({
  contacts,
  waStatus,
  onSync,
  onRefresh,
  onNotify,
}: {
  contacts: Contact[];
  waStatus: WaStatus;
  onSync: () => void;
  onRefresh: () => void;
  onNotify: (msg: string, type?: "success" | "error") => void;
}) {
  const [search, setSearch] = useState("");
  const [showGroups, setShowGroups] = useState<"all" | "contacts" | "groups">("all");

  const filtered = contacts.filter(c => {
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.notify?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchGroup =
      showGroups === "all" ||
      (showGroups === "groups" && c.isGroup) ||
      (showGroups === "contacts" && !c.isGroup);
    return matchSearch && matchGroup;
  });

  const groups = contacts.filter(c => c.isGroup);
  const people = contacts.filter(c => !c.isGroup);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Contacts", value: contacts.length, icon: "👥", color: "#25d366" },
          { label: "People", value: people.length, icon: "👤", color: "#3b82f6" },
          { label: "Groups", value: groups.length, icon: "👨‍👩‍👧‍👦", color: "#8b5cf6" },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: "20px 24px", background: "#22272e", border: "1px solid #2d333b", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search contacts…"
          style={{
            flex: 1, minWidth: 200, padding: "10px 16px",
            background: "#15191e", border: "1px solid #2d333b",
            borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
            outline: "none"
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "contacts", "groups"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setShowGroups(opt)}
              style={{
                padding: "9px 16px", borderRadius: 8, border: "1px solid",
                borderColor: showGroups === opt ? "#25d366" : "#2d333b",
                background: showGroups === opt ? "rgba(37,211,102,0.1)" : "transparent",
                color: showGroups === opt ? "#25d366" : "#94a3b8",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
              }}
            >
              {opt === "all" ? "All" : opt === "contacts" ? "👤 People" : "👥 Groups"}
            </button>
          ))}
        </div>
        <button
          onClick={onSync}
          disabled={waStatus !== "connected"}
          style={{
            padding: "10px 20px",
            background: waStatus === "connected" ? "linear-gradient(135deg, #25d366, #128c7e)" : "#2d333b",
            border: "none", borderRadius: 8, color: "#fff",
            fontWeight: 700, cursor: waStatus === "connected" ? "pointer" : "not-allowed",
            opacity: waStatus === "connected" ? 1 : 0.5,
            fontSize: "0.85rem", whiteSpace: "nowrap",
          }}
        >
          🔄 Sync from WhatsApp
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", background: "#22272e", border: "1px solid #2d333b", borderRadius: "12px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <p style={{ color: "#94a3b8" }}>
            No contacts yet. Connect WhatsApp and click "Sync from WhatsApp".
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden", background: "#22272e", border: "1px solid #2d333b", borderRadius: "12px" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2d333b" }}>
                  {["Type", "Name", "Phone / JID", "Tags", "Notes"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      color: "#94a3b8", fontSize: "0.75rem",
                      fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid #2d333b",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem",
                        fontWeight: 700,
                        background: c.isGroup ? "rgba(139,92,246,0.15)" : "rgba(37,211,102,0.15)",
                        color: c.isGroup ? "#a78bfa" : "#25d366",
                      }}>
                        {c.isGroup ? "Group" : "Contact"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#f8fafc" }}>
                      {c.name ?? c.notify ?? "Unknown"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "0.85rem" }}>
                      {c.phone ? `+${c.phone}` : c.jid}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {c.tags && JSON.parse(c.tags).map((t: string) => (
                        <span key={t} style={{
                          padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem",
                          background: "#15191e", marginRight: 4, color: "#94a3b8"
                        }}>{t}</span>
                      ))}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "0.85rem" }}>
                      {c.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "0.8rem", borderTop: "1px solid #2d333b" }}>
            Showing {filtered.length} of {contacts.length} contacts • Showcase Phonebook
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Templates Tab Component
// ──────────────────────────────────────────────────────────────────────────────
function TemplatesTab({
  templates,
  onRefresh,
  onNotify,
}: {
  templates: Template[];
  onRefresh: () => void;
  onNotify: (msg: string, type?: "success" | "error") => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "message",
    subject: "",
    content: "",
    footer: "",
    mediaUrl: "",
    mediaType: "",
    donationUrl: "",
    isDefault: false,
  });

  const resetForm = () => {
    setForm({
      name: "", category: "message", subject: "", content: "",
      footer: "", mediaUrl: "", mediaType: "", donationUrl: "", isDefault: false,
    });
    setEditing(null);
  };

  const startEdit = (t: Template) => {
    setEditing(t);
    setForm({
      name: t.name, category: t.category, subject: t.subject ?? "",
      content: t.content, footer: t.footer ?? "", mediaUrl: t.mediaUrl ?? "",
      mediaType: t.mediaType ?? "", donationUrl: t.donationUrl ?? "",
      isDefault: t.isDefault,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.content) {
      onNotify("Name and content are required", "error");
      return;
    }
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    const res = await fetch("/api/whatsapp/templates", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      onNotify(editing ? "✅ Template updated" : "✅ Template created");
      setShowForm(false);
      resetForm();
      onRefresh();
    } else {
      onNotify("Failed to save template", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/whatsapp/templates?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      onNotify("🗑️ Template deleted");
      onRefresh();
    }
  };

  const insertVariable = (variable: string) => {
    setForm(f => ({ ...f, content: f.content + `{{${variable}}}` }));
  };

  const categoryColor = (cat: string) =>
    TEMPLATE_CATEGORIES.find(c => c.id === cat)?.color ?? "#64748b";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>
          📄 Message Templates ({templates.length})
        </h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{
            padding: "10px 20px",
            background: showForm ? "transparent" : "linear-gradient(135deg, #25d366, #128c7e)",
            border: showForm ? "1px solid #2d333b" : "none",
            borderRadius: 8, color: showForm ? "#94a3b8" : "#1c2128",
            fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
          }}
        >
          {showForm ? "✕ Cancel" : "+ New Template"}
        </button>
      </div>

      {/* Template Form */}
      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 24, background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: "#f8fafc" }}>
            {editing ? "✏️ Edit Template" : "✨ New Template"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
                Template Name *
              </label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Community Invitation 2025"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#15191e", border: "1px solid #2d333b",
                  borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                  boxSizing: "border-box", outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#15191e", border: "1px solid #2d333b",
                  borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                  outline: "none", cursor: "pointer"
                }}
              >
                {TEMPLATE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id} style={{ background: "#15191e" }}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
              Subject / Title (optional)
            </label>
            <input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. ¡Estás invitado!"
              style={{
                width: "100%", padding: "10px 14px",
                background: "#15191e", border: "1px solid #2d333b",
                borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                boxSizing: "border-box", outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#94a3b8" }}>Message Content *</label>
              <div style={{ display: "flex", gap: 6 }}>
                {["name", "date", "link", "amount"].map(v => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    style={{
                      padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem",
                      background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)",
                      color: "#25d366", cursor: "pointer", fontWeight: 600,
                    }}
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your message here. Use {{name}}, {{date}}, {{link}} for dynamic variables."
              rows={6}
              style={{
                width: "100%", padding: "12px 14px",
                background: "#15191e", border: "1px solid #2d333b",
                borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
                outline: "none"
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
              {form.content.length} characters
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
                💰 Donation Link (optional)
              </label>
              <input
                value={form.donationUrl}
                onChange={e => setForm(f => ({ ...f, donationUrl: e.target.value }))}
                placeholder="https://payment-link.com"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#15191e", border: "1px solid #2d333b",
                  borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                  boxSizing: "border-box", outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
                🖼️ Media Type
              </label>
              <select
                value={form.mediaType}
                onChange={e => setForm(f => ({ ...f, mediaType: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#15191e", border: "1px solid #2d333b",
                  borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                  outline: "none"
                }}
              >
                <option value="" style={{ background: "#15191e" }}>None (Text only)</option>
                <option value="image" style={{ background: "#15191e" }}>🖼️ Image</option>
                <option value="video" style={{ background: "#15191e" }}>🎥 Video</option>
                <option value="audio" style={{ background: "#15191e" }}>🎵 Audio</option>
                <option value="document" style={{ background: "#15191e" }}>📎 Document</option>
              </select>
            </div>
          </div>

          {form.mediaType && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
                Media URL
              </label>
              <input
                value={form.mediaUrl}
                onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#15191e", border: "1px solid #2d333b",
                  borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                  boxSizing: "border-box", outline: "none"
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
              Footer / Signature (optional)
            </label>
            <input
              value={form.footer}
              onChange={e => setForm(f => ({ ...f, footer: e.target.value }))}
              placeholder="— La Yucateca Digital"
              style={{
                width: "100%", padding: "10px 14px",
                background: "#15191e", border: "1px solid #2d333b",
                borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                boxSizing: "border-box", outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleSave}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                border: "none", borderRadius: 8, color: "#1c2128",
                fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
              }}
            >
              {editing ? "💾 Update Template" : "✨ Create Template"}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              style={{
                padding: "12px 24px", background: "transparent",
                border: "1px solid #2d333b", borderRadius: 8,
                color: "#94a3b8", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Template grid */}
      {templates.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📄</div>
          <p style={{ color: "#94a3b8" }}>
            No templates yet. Create one to start building campaigns.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {templates.map(t => {
            const cat = TEMPLATE_CATEGORIES.find(c => c.id === t.category);
            return (
              <div key={t.id} className="card" style={{ padding: 20, background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 99,
                      fontSize: "0.7rem", fontWeight: 700,
                      background: `${cat?.color ?? "#64748b"}20`,
                      color: cat?.color ?? "#64748b", marginBottom: 6,
                    }}>
                      {cat?.label ?? t.category}
                    </span>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#f8fafc" }}>{t.name}</h3>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEdit(t)}
                      style={{
                        padding: "6px 12px", background: "transparent",
                        border: "1px solid #2d333b", borderRadius: 6,
                        color: "#94a3b8", cursor: "pointer", fontSize: "0.8rem",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        padding: "6px 12px", background: "transparent",
                        border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6,
                        color: "#f87171", cursor: "pointer", fontSize: "0.8rem",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{
                  background: "#15191e", borderRadius: 8, padding: "12px 14px",
                  marginBottom: 12, maxHeight: 100, overflowY: "auto",
                }}>
                  <p style={{ fontSize: "0.85rem", color: "#cbd5e1", whiteSpace: "pre-wrap", margin: 0 }}>
                    {t.content}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {t.mediaType && (
                    <span style={{ fontSize: "0.75rem", color: "#3b82f6" }}>
                      📎 {t.mediaType}
                    </span>
                  )}
                  {t.donationUrl && (
                    <span style={{ fontSize: "0.75rem", color: "#10b981" }}>
                      💰 Donation link
                    </span>
                  )}
                  {t.footer && (
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      📝 Has footer
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Campaigns Tab Component
// ──────────────────────────────────────────────────────────────────────────────
function CampaignsTab({
  contacts,
  templates,
  waStatus,
  onRefresh,
  onNotify,
}: {
  contacts: Contact[];
  templates: Template[];
  waStatus: WaStatus;
  onRefresh: () => void;
  onNotify: (msg: string, type?: "success" | "error") => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [campaignName, setCampaignName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState<"all" | "contacts" | "groups">("all");
  const [recipientSearch, setRecipientSearch] = useState("");

  const filteredRecipients = contacts.filter(c => {
    const matchSearch = !recipientSearch ||
      (c.name ?? "").toLowerCase().includes(recipientSearch.toLowerCase()) ||
      (c.phone ?? "").includes(recipientSearch);
    const matchGroup =
      recipientFilter === "all" ||
      (recipientFilter === "groups" && c.isGroup) ||
      (recipientFilter === "contacts" && !c.isGroup);
    return matchSearch && matchGroup;
  });

  const toggleRecipient = (jid: string) => {
    setSelectedRecipients(prev => {
      const next = new Set(prev);
      next.has(jid) ? next.delete(jid) : next.add(jid);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedRecipients(new Set(filteredRecipients.map(c => c.jid)));
  };
  const clearAll = () => setSelectedRecipients(new Set());

  const applyTemplate = (t: Template) => {
    setSelectedTemplate(t);
    let msg = t.content;
    if (t.donationUrl) msg += `\n\n💰 Donar: ${t.donationUrl}`;
    if (t.footer) msg += `\n\n${t.footer}`;
    setCustomMessage(msg);
    setStep(2);
  };

  const handleSend = async () => {
    if (!campaignName) { onNotify("Campaign name required", "error"); return; }
    if (!customMessage) { onNotify("Message required", "error"); return; }
    if (selectedRecipients.size === 0) { onNotify("Select at least one recipient", "error"); return; }
    if (waStatus !== "connected") { onNotify("WhatsApp not connected", "error"); return; }

    setIsSending(true);
    const res = await fetch("/api/whatsapp/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: campaignName,
        templateId: selectedTemplate?.id ?? null,
        message: customMessage,
        recipients: Array.from(selectedRecipients),
        recipientType: recipientFilter,
        sendNow,
        mediaUrl: selectedTemplate?.mediaUrl ?? null,
        mediaType: selectedTemplate?.mediaType ?? null,
      }),
    });

    setIsSending(false);
    if (res.ok) {
      onNotify(`🚀 Campaign "${campaignName}" launched!`);
      setStep(1);
      setSelectedTemplate(null);
      setSelectedRecipients(new Set());
      setCampaignName("");
      setCustomMessage("");
      onRefresh();
    } else {
      onNotify("Failed to create campaign", "error");
    }
  };

  return (
    <div>
      {/* Progress steps */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
        {[
          { n: 1, label: "Choose Template" },
          { n: 2, label: "Select Recipients" },
          { n: 3, label: "Review & Send" },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                opacity: step < s.n ? 0.4 : 1,
              }}
              onClick={() => step > s.n && setStep(s.n as any)}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: step >= s.n ? "#25d366" : "#2d333b",
                color: step >= s.n ? "#1c2128" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "0.9rem", flexShrink: 0,
              }}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span style={{ fontWeight: step === s.n ? 700 : 500, fontSize: "0.9rem", color: "#f8fafc" }}>{s.label}</span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 2, background: "#2d333b",
                margin: "0 16px", alignSelf: "center",
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Template */}
      {step === 1 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
            <h3 style={{ fontWeight: 700, color: "#f8fafc" }}>Select a Template</h3>
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setCustomMessage("");
                setStep(2);
              }}
              style={{
                padding: "8px 16px", background: "transparent",
                border: "1px solid #2d333b", borderRadius: 8,
                color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem",
              }}
            >
              Skip → Custom message
            </button>
          </div>
          {templates.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center", background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
              <p style={{ color: "#94a3b8" }}>
                No templates yet. Go to Templates tab to create one.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {templates.map(t => {
                const cat = TEMPLATE_CATEGORIES.find(c => c.id === t.category);
                return (
                  <div
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="card"
                    style={{
                      padding: 20, cursor: "pointer",
                      background: "#22272e",
                      borderRadius: "16px",
                      border: selectedTemplate?.id === t.id ? "1px solid #25d366" : "1px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 99,
                      fontSize: "0.7rem", fontWeight: 700,
                      background: `${cat?.color ?? "#64748b"}20`, color: cat?.color ?? "#64748b",
                      marginBottom: 8,
                    }}>
                      {cat?.label ?? t.category}
                    </span>
                    <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.95rem", color: "#f8fafc" }}>{t.name}</h4>
                    <p style={{
                      color: "#94a3b8", fontSize: "0.8rem",
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                    }}>
                      {t.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Recipients */}
      {step === 2 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: "#f8fafc" }}>
              Select Recipients ({selectedRecipients.size} selected)
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={selectAll} style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 6, color: "#25d366", cursor: "pointer", fontSize: "0.8rem" }}>
                Select All
              </button>
              <button onClick={clearAll} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #2d333b", borderRadius: 6, color: "#94a3b8", cursor: "pointer", fontSize: "0.8rem" }}>
                Clear
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              value={recipientSearch}
              onChange={e => setRecipientSearch(e.target.value)}
              placeholder="🔍 Search…"
              style={{
                flex: 1, padding: "9px 14px",
                background: "#15191e", border: "1px solid #2d333b",
                borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                outline: "none"
              }}
            />
            {(["all", "contacts", "groups"] as const).map(f => (
              <button
                key={f}
                onClick={() => setRecipientFilter(f)}
                style={{
                  padding: "9px 14px", borderRadius: 8, border: "1px solid",
                  borderColor: recipientFilter === f ? "#25d366" : "#2d333b",
                  background: recipientFilter === f ? "rgba(37,211,102,0.1)" : "transparent",
                  color: recipientFilter === f ? "#25d366" : "#94a3b8",
                  fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                }}
              >
                {f === "all" ? "All" : f === "contacts" ? "👤 People" : "👥 Groups"}
              </button>
            ))}
          </div>

          {contacts.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center", background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
              <p style={{ color: "#94a3b8" }}>
                No contacts in phonebook. Go to Contacts tab → Sync from WhatsApp.
              </p>
            </div>
          ) : (
            <div className="card" style={{ maxHeight: 400, overflowY: "auto", background: "#22272e", border: "1px solid #2d333b", borderRadius: "16px" }}>
              {filteredRecipients.map(c => (
                <label
                  key={c.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    cursor: "pointer", borderBottom: "1px solid #2d333b",
                    background: selectedRecipients.has(c.jid) ? "rgba(37,211,102,0.04)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRecipients.has(c.jid)}
                    onChange={() => toggleRecipient(c.jid)}
                    style={{ width: 16, height: 16, accentColor: "#25d366" }}
                  />
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: c.isGroup ? "rgba(139,92,246,0.15)" : "rgba(37,211,102,0.15)",
                    display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", flexShrink: 0,
                    fontSize: "1rem",
                  }}>
                    {c.isGroup ? "👥" : "👤"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f8fafc" }}>
                      {c.name ?? c.notify ?? "Unknown"}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                      {c.phone ? `+${c.phone}` : c.jid}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4,
                    background: c.isGroup ? "rgba(139,92,246,0.15)" : "rgba(37,211,102,0.15)",
                    color: c.isGroup ? "#a78bfa" : "#25d366",
                  }}>
                    {c.isGroup ? "Group" : "Contact"}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              onClick={() => setStep(1)}
              style={{ padding: "11px 20px", background: "transparent", border: "1px solid #2d333b", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedRecipients.size === 0}
              style={{
                padding: "11px 24px",
                background: selectedRecipients.size > 0 ? "linear-gradient(135deg, #25d366, #128c7e)" : "#2d333b",
                border: "none", borderRadius: 8, color: selectedRecipients.size > 0 ? "#1c2128" : "#94a3b8",
                fontWeight: 700, cursor: selectedRecipients.size > 0 ? "pointer" : "not-allowed",
              }}
            >
              Next → Review ({selectedRecipients.size})
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Send */}
      {step === 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#f8fafc" }}>Review & Launch</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>Campaign Name *</label>
              <input
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. Invitación Fiestas 2025"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#15191e", border: "1px solid #2d333b",
                  borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                  boxSizing: "border-box", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem", color: "#94a3b8" }}>
                Message *
              </label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={8}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "#15191e", border: "1px solid #2d333b",
                  borderRadius: 8, color: "#f8fafc", fontSize: "0.9rem",
                  resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#f8fafc" }}>
                <input
                  type="radio"
                  checked={sendNow}
                  onChange={() => setSendNow(true)}
                  style={{ accentColor: "#25d366" }}
                />
                <span style={{ fontWeight: 600 }}>🚀 Send Now</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#f8fafc" }}>
                <input
                  type="radio"
                  checked={!sendNow}
                  onChange={() => setSendNow(false)}
                  style={{ accentColor: "#25d366" }}
                />
                <span style={{ fontWeight: 600 }}>📋 Save as Draft</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setStep(2)}
                style={{ padding: "12px 20px", background: "transparent", border: "1px solid #2d333b", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}
              >
                ← Back
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                style={{
                  padding: "12px 32px",
                  background: "linear-gradient(135deg, #25d366, #128c7e)",
                  border: "none", borderRadius: 8, color: "#1c2128",
                  fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
                  opacity: isSending ? 0.7 : 1,
                }}
              >
                {isSending ? "⏳ Sending…" : sendNow ? `🚀 Send to ${selectedRecipients.size} recipients` : "💾 Save Draft"}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#f8fafc" }}>Preview</h3>
            <div style={{
              background: "#0c1015",
              borderRadius: 16, padding: 20,
              border: "1px solid rgba(37,211,102,0.2)",
            }}>
              {/* Phone mockup header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 16,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(37,211,102,0.2)", display: "flex",
                  alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "1rem",
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>Recipient</div>
                  <div style={{ color: "#25d366", fontSize: "0.7rem" }}>online</div>
                </div>
              </div>
              {/* Message bubble */}
              <div style={{
                background: "#1f4d2e", borderRadius: "12px 12px 4px 12px",
                padding: "12px 14px", maxWidth: "90%", marginLeft: "auto"
              }}>
                <pre style={{
                  fontSize: "0.82rem", color: "#e0f7e7", margin: 0,
                  whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.5,
                }}>
                  {customMessage || "Your message will appear here…"}
                </pre>
                <div style={{ color: "#6ee7a0", fontSize: "0.7rem", marginTop: 6, textAlign: "right" }}>
                  {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} ✓✓
                </div>
              </div>
            </div>
            {/* Summary */}
            <div className="card" style={{ padding: 16, marginTop: 12, background: "#22272e", border: "1px solid #2d333b", borderRadius: "12px" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, color: "#f8fafc" }}>Campaign Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Recipients</span>
                  <strong style={{ color: "#f8fafc" }}>{selectedRecipients.size}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Template</span>
                  <strong style={{ color: "#f8fafc" }}>{selectedTemplate?.name ?? "Custom"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Delivery</span>
                  <strong style={{ color: "#25d366" }}>{sendNow ? "Immediate" : "Draft"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Est. time</span>
                  <strong style={{ color: "#f8fafc" }}>~{Math.ceil(selectedRecipients.size * 1.5 / 60)} min</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// History Tab Component
// ──────────────────────────────────────────────────────────────────────────────
function HistoryTab({
  campaigns,
  onRefresh,
}: {
  campaigns: Campaign[];
  onRefresh: () => void;
}) {
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + c.failedCount, 0);
  const completed = campaigns.filter(c => c.status === "COMPLETED").length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Campaigns", value: campaigns.length, icon: "🚀", color: "#8b5cf6" },
          { label: "Completed", value: completed, icon: "✅", color: "#22c55e" },
          { label: "Messages Sent", value: totalSent.toLocaleString(), icon: "📨", color: "#25d366" },
          { label: "Failed", value: totalFailed.toLocaleString(), icon: "❌", color: "#ef4444" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "20px 24px", background: "#22272e", border: "1px solid #2d333b", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
        <h3 style={{ fontWeight: 700, color: "#f8fafc" }}>Campaign History</h3>
        <button
          onClick={onRefresh}
          style={{
            padding: "8px 16px", background: "transparent",
            border: "1px solid #2d333b", borderRadius: 8,
            color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", background: "#22272e", border: "1px solid #2d333b", borderRadius: "12px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📊</div>
          <p style={{ color: "#94a3b8" }}>No campaigns yet.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden", background: "#22272e", border: "1px solid #2d333b", borderRadius: "12px" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2d333b" }}>
                  {["Campaign", "Template", "Status", "Recipients", "Sent", "Failed", "Date"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      color: "#94a3b8", fontSize: "0.75rem",
                      fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const recipients = JSON.parse(c.recipients ?? "[]");
                  const deliveryRate = c.totalCount > 0
                    ? Math.round((c.sentCount / c.totalCount) * 100)
                    : 0;
                  return (
                    <tr
                      key={c.id}
                      style={{ borderBottom: "1px solid #2d333b" }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#f8fafc" }}>{c.name}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "0.85rem" }}>
                        {c.template?.name ?? "Custom"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "3px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700,
                          background: `${CAMPAIGN_STATUS_COLORS[c.status] ?? "#64748b"}20`,
                          color: CAMPAIGN_STATUS_COLORS[c.status] ?? "#64748b",
                        }}>
                          {CAMPAIGN_STATUS_ICONS[c.status] ?? "?"} {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8" }}>
                        {recipients.length}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ color: "#22c55e", fontWeight: 700 }}>{c.sentCount}</div>
                        {c.totalCount > 0 && (
                          <div style={{
                            height: 3, borderRadius: 2, background: "#15191e",
                            marginTop: 4, overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%", borderRadius: 2,
                              background: "#22c55e",
                              width: `${deliveryRate}%`,
                              transition: "width 0.5s",
                            }} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#f87171" }}>{c.failedCount}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "0.8rem" }}>
                        {new Date(c.createdAt).toLocaleDateString("es-MX")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
