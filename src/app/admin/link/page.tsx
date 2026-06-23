"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Trash2, Edit2, Plus, Eye, EyeOff, GripVertical } from "lucide-react";




interface AdminLink {
  id: string;
  title: string;
  url: string;
  category: string;
  active: boolean;
  order: number;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
}

export default function LinkManagementPage() {
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    category: "general",
    active: true,
  });
  const [urlError, setUrlError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Fetch links
  const fetchLinks = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append("category", filterCategory);

      const res = await fetch(`/api/admin/links?${params}`);
      if (!res.ok) throw new Error("Failed to fetch links");
      const data = await res.json();
      setLinks(data.links);
      setCategories(data.categories);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [filterCategory]);

  // Validate URL
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      setUrlError("");
      return true;
    } catch {
      setUrlError("Invalid URL format");
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.title.trim()) {
        setError("Title is required");
        return;
      }
      if (!formData.url.trim()) {
        setError("URL is required");
        return;
      }
      if (!validateUrl(formData.url)) {
        return;
      }

      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch("/api/admin/links", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save link");
      }

      setSuccess(editingId ? "Link updated successfully" : "Link created successfully");
      setFormData({ title: "", url: "", category: "general", active: true });
      setEditingId(null);
      setShowForm(false);
      fetchLinks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    setDeleting(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/links?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete link");

      setSuccess("Link deleted successfully");
      fetchLinks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Handle edit
  const handleEdit = (link: AdminLink) => {
    setEditingId(link.id);
    setFormData({
      title: link.title,
      url: link.url,
      category: link.category,
      active: link.active,
    });
    setShowForm(true);
  };

  // Toggle active status
  const handleToggleActive = async (link: AdminLink) => {
    try {
      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: link.id,
          active: !link.active,
        }),
      });

      if (!res.ok) throw new Error("Failed to update link");
      setSuccess("Link status updated");
      fetchLinks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle reordering
  const handleReorder = async (link: AdminLink, direction: "up" | "down") => {
    const currentIndex = links.findIndex((l) => l.id === link.id);
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === links.length - 1)) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newOrder = links[targetIndex].order;
    const currentOrder = link.order;

    try {
      await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: link.id, order: newOrder }),
      });

      await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: links[targetIndex].id, order: currentOrder }),
      });

      fetchLinks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", url: "", category: "general", active: true });
    setShowForm(false);
    setUrlError("");
  };

  return (
    <div style={{ padding: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p className="section-label">Management</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
          Link Management
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Organize important shortcuts and external links
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          { label: "Total Links", value: stats.total, color: "#ff5500" },
          { label: "Active", value: stats.active, color: "#2dd4bf" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              padding: "16px",
              borderLeft: `3px solid ${stat.color}`,
            }}
          >
            <p style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "8px",
            color: "#f43f5e",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(45, 212, 191, 0.1)",
            border: "1px solid rgba(45, 212, 191, 0.3)",
            borderRadius: "8px",
            color: "#2dd4bf",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.875rem",
          }}
        >
          ✓ {success}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={16} /> Add Link
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="card"
          style={{
            padding: "24px",
            marginBottom: "24px",
            border: "1px solid var(--border-accent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontWeight: 700 }}>{editingId ? "Edit Link" : "New Link"}</h3>
            <button
              onClick={resetForm}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 500 }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Documentation"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 500 }}>
                URL *
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => {
                  setFormData({ ...formData, url: e.target.value });
                  if (e.target.value) validateUrl(e.target.value);
                }}
                placeholder="https://example.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "var(--bg-card)",
                  border: `1px solid ${urlError ? "#f43f5e" : "var(--border-subtle)"}`,
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {urlError && (
                <p style={{ color: "#f43f5e", fontSize: "0.75rem", marginTop: "4px" }}>{urlError}</p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 500 }}>
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="general"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", fontSize: "0.85rem", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ marginRight: "8px" }}
                  />
                  Active
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !!urlError}
                className="btn-primary"
                style={{ opacity: submitting || urlError ? 0.6 : 1, cursor: submitting || urlError ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          Loading links...
        </div>
      ) : links.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
            No links found
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Create First Link
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {links.map((link, index) => (
            <div
              key={link.id}
              className="card"
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid var(--border-subtle)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            >
              {/* Drag Handle */}
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "grab",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
                onMouseDown={() => setDraggedId(link.id)}
                onMouseUp={() => setDraggedId(null)}
              >
                <GripVertical size={16} />
              </button>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>{link.title}</h4>
                  <span
                    style={{
                      background: "rgba(255, 85, 0, 0.1)",
                      color: "#ff5500",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {link.category}
                  </span>
                  <span
                    style={{
                      background: link.active ? "rgba(45, 212, 191, 0.1)" : "rgba(244, 63, 94, 0.1)",
                      color: link.active ? "#2dd4bf" : "#f43f5e",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "0.7rem",
                    }}
                  >
                    {link.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.title = link.url)}
                >
                  {link.url}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={() => setPreviewingId(previewingId === link.id ? null : link.id)}
                  title={previewingId === link.id ? "Hide preview" : "Preview link"}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {previewingId === link.id ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <button
                  onClick={() => handleToggleActive(link)}
                  title={link.active ? "Deactivate" : "Activate"}
                  style={{
                    background: link.active ? "rgba(45, 212, 191, 0.1)" : "rgba(244, 63, 94, 0.1)",
                    border: "1px solid " + (link.active ? "rgba(45, 212, 191, 0.3)" : "rgba(244, 63, 94, 0.3)"),
                    color: link.active ? "#2dd4bf" : "#f43f5e",
                    cursor: "pointer",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {link.active ? "Active" : "Inactive"}
                </button>

                <button
                  onClick={() => handleEdit(link)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.875rem",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <Edit2 size={14} />
                </button>

                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={deleting === link.id}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f43f5e",
                    cursor: deleting === link.id ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.875rem",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    transition: "all 0.2s",
                    opacity: deleting === link.id ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (deleting !== link.id) {
                      e.currentTarget.style.background = "rgba(244, 63, 94, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
