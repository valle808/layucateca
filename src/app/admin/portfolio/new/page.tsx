"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPortfolioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
    liveUrl: "",
    price: "",
    published: false,
  });

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: form.price ? parseFloat(form.price) : null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/portfolio");
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px" }}>
        <Link href="/admin/portfolio" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>← Back to Portfolio</Link>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "12px" }}>New Portfolio Item</h1>
      </div>

      {error && (
        <div style={{ padding: "14px 18px", borderRadius: "8px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#f43f5e", marginBottom: "24px", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <form id="new-portfolio-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label htmlFor="pf-title" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Title *</label>
          <input id="pf-title" type="text" placeholder="Project name..." className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))} required />
        </div>
        <div>
          <label htmlFor="pf-slug" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Slug *</label>
          <input id="pf-slug" type="text" className="input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} required style={{ fontFamily: "monospace" }} />
        </div>
        <div>
          <label htmlFor="pf-description" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description *</label>
          <textarea id="pf-description" placeholder="Describe this project..." className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required style={{ minHeight: "160px" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label htmlFor="pf-image" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cover Image URL</label>
            <input id="pf-image" type="url" placeholder="https://..." className="input" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="pf-live" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live URL</label>
            <input id="pf-live" type="url" placeholder="https://client-site.com" className="input" value={form.liveUrl} onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))} />
          </div>
        </div>
        <div>
          <label htmlFor="pf-price" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price (USD)</label>
          <input id="pf-price" type="number" placeholder="1500" className="input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} min="0" step="0.01" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}>
          <input id="pf-published" type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "var(--accent-gold)", cursor: "pointer" }} />
          <label htmlFor="pf-published" style={{ fontWeight: 600, cursor: "pointer" }}>Publish immediately</label>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button id="save-portfolio-btn" type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save Item"}
          </button>
          <Link href="/admin/portfolio" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
