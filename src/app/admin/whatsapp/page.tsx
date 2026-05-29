"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────
export default function WhatsAppAdminPage() {
  const [activeTab, setActiveTab] = useState<
    "connect" | "contacts" | "templates" | "campaigns" | "history"
  >("connect");

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

  // ── SSE connection ──────────────────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource("/api/whatsapp/events");
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

    return () => es.close();
  }, []);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Fetch data ──────────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchContacts();
    fetchTemplates();
    fetchCampaigns();
  }, [fetchContacts, fetchTemplates, fetchCampaigns]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleConnect = async () => {
    await fetch("/api/whatsapp/connect", { method: "POST" });
  };

  const handleDisconnect = async () => {
    await fetch("/api/whatsapp/disconnect", { method: "POST" });
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

  const tabs = [
    { id: "connect", label: "📱 Connection", badge: null },
    { id: "contacts", label: "👥 Phonebook", badge: contacts.length || null },
    { id: "templates", label: "📄 Templates", badge: templates.length || null },
    { id: "campaigns", label: "🚀 Campaigns", badge: null },
    { id: "history", label: "📊 History", badge: campaigns.filter(c => c.status === "COMPLETED").length || null },
  ] as const;

  return (
    <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg, #25d366, #128c7e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem", boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          }}>
            💬
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 2 }}>
              WhatsApp Campaign Studio
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Real-time messaging, campaigns & private phonebook — admin only
            </p>
          </div>
          {/* Status pill */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 99,
              background: `${STATUS_COLORS[waState.status]}22`,
              border: `1px solid ${STATUS_COLORS[waState.status]}44`,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: STATUS_COLORS[waState.status],
                boxShadow: `0 0 0 3px ${STATUS_COLORS[waState.status]}33`,
                animation: waState.status === "connecting" ? "pulse 1s infinite" : "none",
              }} />
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: STATUS_COLORS[waState.status] }}>
                {STATUS_LABELS[waState.status]}
              </span>
              {waState.phone && (
                <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  +{waState.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "10px 18px",
              background: "none", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #25d366" : "2px solid transparent",
              color: activeTab === tab.id ? "#25d366" : "var(--text-secondary)",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: "0.9rem", cursor: "pointer",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
              borderRadius: "8px 8px 0 0",
            }}
          >
            {tab.label}
            {tab.badge ? (
              <span style={{
                padding: "2px 8px", borderRadius: 99, fontSize: "0.7rem",
                background: activeTab === tab.id ? "#25d36622" : "var(--bg-tertiary)",
                color: activeTab === tab.id ? "#25d366" : "var(--text-secondary)",
                fontWeight: 700,
              }}>{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "connect" && (
        <ConnectTab
          waState={waState}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      )}
      {activeTab === "contacts" && (
        <ContactsTab
          contacts={contacts}
          waStatus={waState.status}
          onSync={handleSyncContacts}
          onRefresh={fetchContacts}
          onNotify={notify}
        />
      )}
      {activeTab === "templates" && (
        <TemplatesTab
          templates={templates}
          onRefresh={fetchTemplates}
          onNotify={notify}
        />
      )}
      {activeTab === "campaigns" && (
        <CampaignsTab
          contacts={contacts}
          templates={templates}
          waStatus={waState.status}
          onRefresh={fetchCampaigns}
          onNotify={notify}
        />
      )}
      {activeTab === "history" && (
        <HistoryTab
          campaigns={campaigns}
          onRefresh={fetchCampaigns}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Connect Tab
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* QR / Status card */}
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 24 }}>
          📱 WhatsApp Connection
        </h2>

        {waState.status === "disconnected" && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>📵</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
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
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              🔗 Connect WhatsApp
            </button>
          </div>
        )}

        {waState.status === "connecting" && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⚙️</div>
            <p style={{ color: "var(--text-secondary)" }}>Initializing connection…</p>
          </div>
        )}

        {waState.status === "qr" && waState.qrBase64 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: "0.9rem" }}>
              Open WhatsApp → ⋮ Menu → Linked Devices → Link a Device
            </p>
            <div style={{
              display: "inline-block", padding: 16,
              background: "#fff", borderRadius: 16,
              boxShadow: "0 0 0 4px #25d36633, 0 8px 40px rgba(37,211,102,0.2)",
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
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#25d366", marginBottom: 8 }}>
              Connected!
            </h3>
            {waState.name && (
              <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 4 }}>{waState.name}</p>
            )}
            {waState.phone && (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 24 }}>
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
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20 }}>
          📖 How to Connect
        </h2>
        <ol style={{ paddingLeft: 20, color: "var(--text-secondary)", lineHeight: 1.9 }}>
          {[
            'Click \u201cConnect WhatsApp\u201d to generate a QR code',
            'Open WhatsApp on your phone',
            'Go to Menu (\u22ee) \u2192 Linked Devices',
            'Tap \u201cLink a Device\u201d',
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
          <ul style={{ paddingLeft: 20, color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.8 }}>
            <li>Session stored securely on server</li>
            <li>Phonebook is admin-only (never public)</li>
            <li>All messages sent via official WhatsApp Web protocol</li>
            <li>Respect recipients — avoid spam</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Contacts Tab
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Contacts", value: contacts.length, icon: "👥", color: "#25d366" },
          { label: "People", value: people.length, icon: "👤", color: "#3b82f6" },
          { label: "Groups", value: groups.length, icon: "👨‍👩‍👧‍👦", color: "#8b5cf6" },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{stat.label}</div>
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
            background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "contacts", "groups"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setShowGroups(opt)}
              style={{
                padding: "9px 16px", borderRadius: 8, border: "1px solid",
                borderColor: showGroups === opt ? "#25d366" : "var(--border-subtle)",
                background: showGroups === opt ? "#25d36620" : "transparent",
                color: showGroups === opt ? "#25d366" : "var(--text-secondary)",
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
            background: waStatus === "connected" ? "linear-gradient(135deg, #25d366, #128c7e)" : "var(--bg-tertiary)",
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
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <p style={{ color: "var(--text-secondary)" }}>
            No contacts yet. Connect WhatsApp and click "Sync from WhatsApp".
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Type", "Name", "Phone / JID", "Tags", "Notes"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      color: "var(--text-secondary)", fontSize: "0.75rem",
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
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem",
                        fontWeight: 700,
                        background: c.isGroup ? "#8b5cf620" : "#25d36620",
                        color: c.isGroup ? "#a78bfa" : "#25d366",
                      }}>
                        {c.isGroup ? "Group" : "Contact"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                      {c.name ?? c.notify ?? "Unknown"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {c.phone ? `+${c.phone}` : c.jid}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {c.tags && JSON.parse(c.tags).map((t: string) => (
                        <span key={t} style={{
                          padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem",
                          background: "var(--bg-tertiary)", marginRight: 4,
                        }}>{t}</span>
                      ))}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {c.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.8rem", borderTop: "1px solid var(--border-subtle)" }}>
            Showing {filtered.length} of {contacts.length} contacts • Admin-only private phonebook
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Templates Tab
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
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
          📄 Message Templates ({templates.length})
        </h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{
            padding: "10px 20px",
            background: showForm ? "transparent" : "linear-gradient(135deg, #25d366, #128c7e)",
            border: showForm ? "1px solid var(--border-subtle)" : "none",
            borderRadius: 8, color: showForm ? "var(--text-secondary)" : "#fff",
            fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
          }}
        >
          {showForm ? "✕ Cancel" : "+ New Template"}
        </button>
      </div>

      {/* Template Form */}
      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>
            {editing ? "✏️ Edit Template" : "✨ New Template"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
                Template Name *
              </label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Community Invitation 2025"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                }}
              >
                {TEMPLATE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
              Subject / Title (optional)
            </label>
            <input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. ¡Estás invitado!"
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Message Content *</label>
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
                background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
              {form.content.length} characters
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
                💰 Donation Link (optional)
              </label>
              <input
                value={form.donationUrl}
                onChange={e => setForm(f => ({ ...f, donationUrl: e.target.value }))}
                placeholder="https://payment-link.com"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
                🖼️ Media Type
              </label>
              <select
                value={form.mediaType}
                onChange={e => setForm(f => ({ ...f, mediaType: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                }}
              >
                <option value="">None (Text only)</option>
                <option value="image">🖼️ Image</option>
                <option value="video">🎥 Video</option>
                <option value="audio">🎵 Audio</option>
                <option value="document">📎 Document</option>
              </select>
            </div>
          </div>

          {form.mediaType && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
                Media URL
              </label>
              <input
                value={form.mediaUrl}
                onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
              Footer / Signature (optional)
            </label>
            <input
              value={form.footer}
              onChange={e => setForm(f => ({ ...f, footer: e.target.value }))}
              placeholder="— La Yucateca Digital"
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleSave}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                border: "none", borderRadius: 8, color: "#fff",
                fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
              }}
            >
              {editing ? "💾 Update Template" : "✨ Create Template"}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              style={{
                padding: "12px 24px", background: "transparent",
                border: "1px solid var(--border-subtle)", borderRadius: 8,
                color: "var(--text-secondary)", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Template grid */}
      {templates.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📄</div>
          <p style={{ color: "var(--text-secondary)" }}>
            No templates yet. Create one to start building campaigns.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {templates.map(t => {
            const cat = TEMPLATE_CATEGORIES.find(c => c.id === t.category);
            return (
              <div key={t.id} className="card" style={{ padding: 20 }}>
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
                    <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{t.name}</h3>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEdit(t)}
                      style={{
                        padding: "6px 12px", background: "transparent",
                        border: "1px solid var(--border-subtle)", borderRadius: 6,
                        color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem",
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
                  background: "var(--bg-tertiary)", borderRadius: 8, padding: "12px 14px",
                  marginBottom: 12, maxHeight: 100, overflowY: "auto",
                }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap", margin: 0 }}>
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
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
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
// Campaigns Tab
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
      onNotify(`🚀 Campaign "${campaignName}" ${sendNow ? "launched!" : "saved as draft"}`);
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
                background: step >= s.n ? "#25d366" : "var(--bg-tertiary)",
                color: step >= s.n ? "#fff" : "var(--text-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "0.9rem", flexShrink: 0,
              }}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span style={{ fontWeight: step === s.n ? 700 : 500, fontSize: "0.9rem" }}>{s.label}</span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 2, background: "var(--border-subtle)",
                margin: "0 16px", alignSelf: "center",
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Template */}
      {step === 1 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Select a Template</h3>
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setCustomMessage("");
                setStep(2);
              }}
              style={{
                padding: "8px 16px", background: "transparent",
                border: "1px solid var(--border-subtle)", borderRadius: 8,
                color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem",
              }}
            >
              Skip → Custom message
            </button>
          </div>
          {templates.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>
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
                      border: selectedTemplate?.id === t.id ? "1px solid #25d366" : "1px solid transparent",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#25d36644"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = selectedTemplate?.id === t.id ? "#25d366" : "transparent"}
                  >
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 99,
                      fontSize: "0.7rem", fontWeight: 700,
                      background: `${cat?.color ?? "#64748b"}20`, color: cat?.color ?? "#64748b",
                      marginBottom: 8,
                    }}>
                      {cat?.label ?? t.category}
                    </span>
                    <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.95rem" }}>{t.name}</h4>
                    <p style={{
                      color: "var(--text-secondary)", fontSize: "0.8rem",
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
            <h3 style={{ fontWeight: 700 }}>
              Select Recipients ({selectedRecipients.size} selected)
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={selectAll} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #25d36644", borderRadius: 6, color: "#25d366", cursor: "pointer", fontSize: "0.8rem" }}>
                Select All
              </button>
              <button onClick={clearAll} style={{ padding: "6px 14px", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}>
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
                background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
              }}
            />
            {(["all", "contacts", "groups"] as const).map(f => (
              <button
                key={f}
                onClick={() => setRecipientFilter(f)}
                style={{
                  padding: "9px 14px", borderRadius: 8, border: "1px solid",
                  borderColor: recipientFilter === f ? "#25d366" : "var(--border-subtle)",
                  background: recipientFilter === f ? "#25d36620" : "transparent",
                  color: recipientFilter === f ? "#25d366" : "var(--text-secondary)",
                  fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                }}
              >
                {f === "all" ? "All" : f === "contacts" ? "👤 People" : "👥 Groups"}
              </button>
            ))}
          </div>

          {contacts.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>
                No contacts in phonebook. Go to Contacts tab → Sync from WhatsApp.
              </p>
            </div>
          ) : (
            <div className="card" style={{ maxHeight: 400, overflowY: "auto" }}>
              {filteredRecipients.map(c => (
                <label
                  key={c.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    cursor: "pointer", borderBottom: "1px solid var(--border-subtle)",
                    background: selectedRecipients.has(c.jid) ? "#25d36608" : "transparent",
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
                    background: c.isGroup ? "rgba(139,92,246,0.2)" : "rgba(37,211,102,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    fontSize: "1rem",
                  }}>
                    {c.isGroup ? "👥" : "👤"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {c.name ?? c.notify ?? "Unknown"}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
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
              style={{ padding: "11px 20px", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-secondary)", cursor: "pointer" }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedRecipients.size === 0}
              style={{
                padding: "11px 24px",
                background: selectedRecipients.size > 0 ? "linear-gradient(135deg, #25d366, #128c7e)" : "var(--bg-tertiary)",
                border: "none", borderRadius: 8, color: "#fff",
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Review & Launch</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>Campaign Name *</label>
              <input
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. Invitación Fiestas 2025"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.85rem" }}>
                Message *
              </label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={8}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
                  resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  checked={sendNow}
                  onChange={() => setSendNow(true)}
                  style={{ accentColor: "#25d366" }}
                />
                <span style={{ fontWeight: 600 }}>🚀 Send Now</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
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
                style={{ padding: "12px 20px", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-secondary)", cursor: "pointer" }}
              >
                ← Back
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                style={{
                  padding: "12px 32px",
                  background: "linear-gradient(135deg, #25d366, #128c7e)",
                  border: "none", borderRadius: 8, color: "#fff",
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
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Preview</h3>
            <div style={{
              background: "#0a1628",
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
                  alignItems: "center", justifyContent: "center", fontSize: "1rem",
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
                padding: "12px 14px", maxWidth: "90%",
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
            <div className="card" style={{ padding: 16, marginTop: 12 }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Campaign Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Recipients</span>
                  <strong>{selectedRecipients.size}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Template</span>
                  <strong>{selectedTemplate?.name ?? "Custom"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Delivery</span>
                  <strong style={{ color: "#25d366" }}>{sendNow ? "Immediate" : "Draft"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Est. time</span>
                  <strong>~{Math.ceil(selectedRecipients.size * 1.5 / 60)} min</strong>
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
// History Tab
// ──────────────────────────────────────────────────────────────────────────────
function HistoryTab({
  campaigns,
  onRefresh,
}: {
  campaigns: Campaign[];
  onRefresh: () => void;
}) {
  const statusColor: Record<string, string> = {
    DRAFT: "#64748b",
    RUNNING: "#f59e0b",
    COMPLETED: "#22c55e",
    FAILED: "#ef4444",
    SCHEDULED: "#3b82f6",
  };

  const statusIcon: Record<string, string> = {
    DRAFT: "📋",
    RUNNING: "⏳",
    COMPLETED: "✅",
    FAILED: "❌",
    SCHEDULED: "🗓️",
  };

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + c.failedCount, 0);
  const completed = campaigns.filter(c => c.status === "COMPLETED").length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Campaigns", value: campaigns.length, icon: "🚀", color: "#8b5cf6" },
          { label: "Completed", value: completed, icon: "✅", color: "#22c55e" },
          { label: "Messages Sent", value: totalSent.toLocaleString(), icon: "📨", color: "#25d366" },
          { label: "Failed", value: totalFailed.toLocaleString(), icon: "❌", color: "#ef4444" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700 }}>Campaign History</h3>
        <button
          onClick={onRefresh}
          style={{
            padding: "8px 16px", background: "transparent",
            border: "1px solid var(--border-subtle)", borderRadius: 8,
            color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📊</div>
          <p style={{ color: "var(--text-secondary)" }}>No campaigns yet.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Campaign", "Template", "Status", "Recipients", "Sent", "Failed", "Date"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      color: "var(--text-secondary)", fontSize: "0.75rem",
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
                      style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        {c.template?.name ?? "Custom"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "3px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700,
                          background: `${statusColor[c.status] ?? "#64748b"}20`,
                          color: statusColor[c.status] ?? "#64748b",
                        }}>
                          {statusIcon[c.status] ?? "?"} {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                        {recipients.length}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ color: "#22c55e", fontWeight: 700 }}>{c.sentCount}</div>
                        {c.totalCount > 0 && (
                          <div style={{
                            height: 3, borderRadius: 2, background: "var(--bg-tertiary)",
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
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
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
