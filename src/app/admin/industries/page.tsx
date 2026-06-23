"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Trash2, Edit2, Plus } from "lucide-react";




interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  active: boolean;
  order: number;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
}

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "briefcase",
    active: true,
  });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch industries
  const fetchIndustries = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterActive) params.append("active", filterActive);

      const res = await fetch(`/api/admin/industries?${params}`);
      if (!res.ok) throw new Error("Failed to fetch industries");
      const data = await res.json();
      setIndustries(data.industries);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, [search, filterActive]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.name.trim()) {
        setError("Name is required");
        return;
      }

      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch("/api/admin/industries", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save industry");
      }

      setSuccess(editingId ? "Industry updated successfully" : "Industry created successfully");
      setFormData({ name: "", description: "", icon: "briefcase", active: true });
      setEditingId(null);
      setShowForm(false);
      fetchIndustries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this industry?")) return;

    setDeleting(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/industries?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete industry");

      setSuccess("Industry deleted successfully");
      fetchIndustries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Handle edit
  const handleEdit = (industry: Industry) => {
    setEditingId(industry.id);
    setFormData({
      name: industry.name,
      description: industry.description,
      icon: industry.icon,
      active: industry.active,
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", icon: "briefcase", active: true });
    setShowForm(false);
  };

  return (
    <div style={{ padding: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p className="section-label">Management</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
          Industries
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage industry categories for your services
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
          { label: "Total", value: stats.total, color: "#ff5500" },
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
        <input
          type="text"
          placeholder="Search industries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "10px 14px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
          }}
        />
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
          }}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={16} /> Add Industry
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
            <h3 style={{ fontWeight: 700 }}>
              {editingId ? "Edit Industry" : "New Industry"}
            </h3>
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
                Industry Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Web Development"
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Industry description..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  minHeight: "80px",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 500 }}>
                  Icon/Slug
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="briefcase"
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
                disabled={submitting}
                className="btn-primary"
                style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          Loading industries...
        </div>
      ) : industries.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
            No industries found
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Create First Industry
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Name", "Description", "Status", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {industries.map((industry) => (
                <tr
                  key={industry.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                  className="admin-table-row"
                >
                  <td style={{ padding: "14px 16px", fontWeight: 500, fontSize: "0.9rem" }}>
                    {industry.name}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "300px" }}>
                    {industry.description.substring(0, 50)}
                    {industry.description.length > 50 ? "..." : ""}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      className="badge"
                      style={{
                        background: industry.active ? "rgba(45, 212, 191, 0.1)" : "rgba(244, 63, 94, 0.1)",
                        color: industry.active ? "#2dd4bf" : "#f43f5e",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {industry.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    {new Date(industry.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEdit(industry)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.875rem",
                        padding: "6px 12px",
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
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(industry.id)}
                      disabled={deleting === industry.id}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f43f5e",
                        cursor: deleting === industry.id ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        transition: "all 0.2s",
                        opacity: deleting === industry.id ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(244, 63, 94, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                      }}
                    >
                      <Trash2 size={14} /> {deleting === industry.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
