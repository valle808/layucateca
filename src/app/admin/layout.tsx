"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/posts", label: "Posts", icon: "📰" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "🎨" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/industries", label: "Industries", icon: "🏭" },
  { href: "/admin/link", label: "Links", icon: "🔗" },
  { href: "/admin/reports", label: "Reports", icon: "📊" },
  { href: "/admin/whatsapp", label: "WhatsApp Studio", icon: "💬" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        style={{
          width: "260px",
          minHeight: "100vh",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          overflowY: "auto",
        }}
      >
        {/* Sidebar brand */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "9px",
                background: "linear-gradient(135deg, #d4a853, #b8892a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "0.9rem",
                color: "#0a0a0f",
                flexShrink: 0,
              }}
            >
              LY
            </div>
            <div>
              <p className="gradient-text" style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
                La Yucateca
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase" }}>
                CMS
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              padding: "0 8px",
              marginBottom: "8px",
            }}
          >
            Management
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="admin-nav-item"
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom link */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border-subtle)" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              transition: "all 0.2s",
            }}
          >
            ← View Site
          </Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).adminLogout) {
                (window as any).adminLogout();
              }
            }}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              background: "none",
              color: "#f43f5e",
              fontSize: "0.875rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              marginTop: "8px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(244,63,94,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            🔒 Secure Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: "260px", flex: 1, minHeight: "100vh" }}>
        {children}
      </div>
    </div>
    </AdminGuard>
  );
}
