"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";




interface Props {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    imageUrl: "",
    published: false,
  });

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => setForm({ title: data.title, slug: data.slug, content: data.content, imageUrl: data.imageUrl || "", published: data.published }));
  }, [id]);

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(true);
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    router.push("/admin/posts");
    router.refresh();
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <Link href="/admin/posts" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Posts
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "12px" }}>Edit Post</h1>
        </div>
        <button
          id="delete-post-btn"
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: "10px 18px",
            background: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.3)",
            color: "#f43f5e",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
            transition: "all 0.2s",
          }}
        >
          {deleting ? "Deleting..." : "🗑 Delete"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "14px 18px", borderRadius: "8px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#f43f5e", marginBottom: "24px", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <form id="edit-post-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label htmlFor="edit-post-title" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Title *</label>
          <input id="edit-post-title" type="text" className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))} required />
        </div>
        <div>
          <label htmlFor="edit-post-slug" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Slug *</label>
          <input id="edit-post-slug" type="text" className="input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} required style={{ fontFamily: "monospace" }} />
        </div>
        <div>
          <label htmlFor="edit-post-image" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cover Image URL</label>
          <input id="edit-post-image" type="url" className="input" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="edit-post-content" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Content *</label>
          <textarea id="edit-post-content" className="input" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required style={{ minHeight: "300px" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}>
          <input id="edit-post-published" type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "var(--accent-gold)", cursor: "pointer" }} />
          <label htmlFor="edit-post-published" style={{ fontWeight: 600, cursor: "pointer" }}>Published</label>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button id="update-post-btn" type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Update Post"}
          </button>
          <Link href="/admin/posts" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
