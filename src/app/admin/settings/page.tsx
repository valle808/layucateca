export default function AdminSettingsPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "600px" }}>
      <div style={{ marginBottom: "32px" }}>
        <p className="section-label">Configuration</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
          Manage your site configuration.
        </p>
      </div>

      <div className="card" style={{ padding: "32px", marginBottom: "20px" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "20px" }}>Site Information</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label htmlFor="site-name" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Site Name
            </label>
            <input id="site-name" type="text" defaultValue="La Yucateca" className="input" />
          </div>
          <div>
            <label htmlFor="site-tagline" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Tagline
            </label>
            <input id="site-tagline" type="text" defaultValue="News & Web Design Portal" className="input" />
          </div>
          <div>
            <label htmlFor="site-email" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Contact Email
            </label>
            <input id="site-email" type="email" defaultValue="hello@layucateca.com" className="input" />
          </div>
        </div>
        <div style={{ marginTop: "24px" }}>
          <button id="save-settings-btn" className="btn-primary">Save Settings</button>
        </div>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>Database</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "20px" }}>
          Currently using SQLite (local). For production on Vercel, migrate to PostgreSQL via Neon or Supabase.
        </p>
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            background: "rgba(212,168,83,0.08)",
            border: "1px solid rgba(212,168,83,0.2)",
            fontSize: "0.85rem",
            color: "var(--accent-gold)",
          }}
        >
          💡 Tip: Set <code style={{ fontFamily: "monospace" }}>DATABASE_URL</code> in your Vercel environment variables to a PostgreSQL connection string to enable cloud persistence.
        </div>
      </div>
    </div>
  );
}
