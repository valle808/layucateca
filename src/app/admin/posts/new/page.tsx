"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    imageUrl: "",
    published: false,
  });

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (v: string) => {
    setForm((f) => ({ ...f, title: v, slug: slugify(v) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
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

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px" }}>
        <Link href="/admin/posts" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back to Posts
        </Link>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "12px" }}>New Post</h1>
      </div>

      {error && (
        <div style={{ padding: "14px 18px", borderRadius: "8px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#f43f5e", marginBottom: "24px", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <form id="new-post-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label htmlFor="post-title" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Title *
          </label>
          <input
            id="post-title"
            type="text"
            placeholder="Enter post title..."
            className="input"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="post-slug" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Slug *
          </label>
          <input
            id="post-slug"
            type="text"
            placeholder="url-friendly-slug"
            className="input"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            required
            style={{ fontFamily: "monospace" }}
          />
        </div>

        <div>
          <label htmlFor="post-image" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Cover Image URL
          </label>
          <input
            id="post-image"
            type="url"
            placeholder="https://example.com/image.jpg"
            className="input"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="post-content" style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Content *
          </label>
          <textarea
            id="post-content"
            placeholder="Write your article content here..."
            className="input"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            required
            style={{ minHeight: "300px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}>
          <input
            id="post-published"
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            style={{ width: 18, height: 18, accentColor: "var(--accent-gold)", cursor: "pointer" }}
          />
          <label htmlFor="post-published" style={{ fontWeight: 600, cursor: "pointer" }}>
            Publish immediately
          </label>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
            (uncheck to save as draft)
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
          <button
            id="save-post-btn"
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Post"}
          </button>
          <Link href="/admin/posts" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
