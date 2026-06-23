"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Download } from "lucide-react";




interface ReportData {
  totalUsers?: number;
  usersThisMonth?: number;
  adminUsers?: number;
  totalPosts?: number;
  publishedPosts?: number;
  draftPosts?: number;
  totalPortfolioItems?: number;
  publishedPortfolio?: number;
  totalComments?: number;
  totalReports?: number;
  totalPostViews?: number;
  avgPostViews?: number;
  topPost?: any;
  systemHealth?: {
    status: string;
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
  };
}

interface Snapshot {
  id: string;
  type: string;
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  publishedPosts: number;
  totalReports: number;
  totalComments: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  timestamp: string;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("all");
  const [data, setData] = useState<ReportData>({});
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch report data
  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("type", reportType);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const result = await res.json();
      setData(result.data);
      setSnapshots(result.snapshots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, startDate, endDate]);

  // Export data
  const handleExport = () => {
    const exportData = {
      type: reportType,
      exportedAt: new Date().toISOString(),
      data,
      snapshots,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportType}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  // Create snapshot
  const handleSnapshot = async () => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "manual" }),
      });
      if (!res.ok) throw new Error("Failed to create snapshot");
      fetchReports();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p className="section-label">Analytics</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
          Reports & Analytics
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          View system performance, content metrics, and user statistics
        </p>
      </div>

      {/* Error Alert */}
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
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
          }}
        >
          <option value="all">All Reports</option>
          <option value="users">Users</option>
          <option value="content">Content</option>
          <option value="performance">Performance</option>
          <option value="system">System Health</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
          }}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
          }}
        />

        <button onClick={handleSnapshot} className="btn-secondary">
          Take Snapshot
        </button>

        <button
          onClick={handleExport}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Download size={16} /> Export
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          Loading reports...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          {reportType === "all" || reportType === "users" ? (
            <div>
              <p className="section-label">User Statistics</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {[
                  { label: "Total Users", value: data.totalUsers || 0, color: "#ff5500" },
                  { label: "This Month", value: data.usersThisMonth || 0, color: "#2dd4bf" },
                  { label: "Admin Users", value: data.adminUsers || 0, color: "#7c3aed" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="card"
                    style={{
                      padding: "20px",
                      borderLeft: `3px solid ${stat.color}`,
                    }}
                  >
                    <p style={{ fontSize: "2rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {reportType === "all" || reportType === "content" ? (
            <div>
              <p className="section-label">Content Metrics</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {[
                  { label: "Total Posts", value: data.totalPosts || 0, color: "#ff5500" },
                  { label: "Published", value: data.publishedPosts || 0, color: "#2dd4bf" },
                  { label: "Drafts", value: data.draftPosts || 0, color: "#f43f5e" },
                  { label: "Portfolio Items", value: data.totalPortfolioItems || 0, color: "#7c3aed" },
                  { label: "Total Comments", value: data.totalComments || 0, color: "#d4a853" },
                  { label: "Reports", value: data.totalReports || 0, color: "#64748b" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="card"
                    style={{
                      padding: "20px",
                      borderLeft: `3px solid ${stat.color}`,
                    }}
                  >
                    <p style={{ fontSize: "2rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {reportType === "all" || reportType === "performance" ? (
            <div>
              <p className="section-label">Performance</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {[
                  { label: "Total Post Views", value: data.totalPostViews || 0, color: "#ff5500" },
                  { label: "Avg Views/Post", value: data.avgPostViews || 0, color: "#2dd4bf" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="card"
                    style={{
                      padding: "20px",
                      borderLeft: `3px solid ${stat.color}`,
                    }}
                  >
                    <p style={{ fontSize: "2rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {reportType === "all" || reportType === "system" ? (
            <div>
              <p className="section-label">System Health</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {data.systemHealth && [
                  { label: "Status", value: data.systemHealth.status, color: "#2dd4bf" },
                  { label: "Uptime (hours)", value: data.systemHealth.uptime, color: "#ff5500" },
                  { label: "CPU Usage", value: `${Math.round(data.systemHealth.cpuUsage)}%`, color: "#7c3aed" },
                  { label: "Memory", value: `${Math.round(data.systemHealth.memoryUsage)}%`, color: "#d4a853" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="card"
                    style={{
                      padding: "20px",
                      borderLeft: `3px solid ${stat.color}`,
                    }}
                  >
                    <p style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Snapshots Table */}
          {snapshots.length > 0 && (
            <div>
              <p className="section-label">Recent Snapshots</p>
              <div className="card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      {["Type", "Users", "Posts", "Uptime", "CPU", "Memory", "Timestamp"].map((h) => (
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
                    {snapshots.slice(0, 20).map((snapshot) => (
                      <tr
                        key={snapshot.id}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                        }}
                        className="admin-table-row"
                      >
                        <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                          <span
                            style={{
                              background: "rgba(255, 85, 0, 0.1)",
                              color: "#ff5500",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {snapshot.type}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                          {snapshot.totalUsers} / {snapshot.activeUsers}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                          {snapshot.publishedPosts} / {snapshot.totalPosts}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                          {snapshot.uptime}h
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                          {Math.round(snapshot.cpuUsage)}%
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                          {Math.round(snapshot.memoryUsage)}%
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          {new Date(snapshot.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
