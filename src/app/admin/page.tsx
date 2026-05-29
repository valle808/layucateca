import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalPosts, publishedPosts, totalPortfolio, publishedPortfolio] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.portfolioItem.count(),
    prisma.portfolioItem.count({ where: { published: true } }),
  ]);

  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Total Posts", value: totalPosts, sub: `${publishedPosts} published`, icon: "📰", color: "#2dd4bf" },
    { label: "Draft Posts", value: totalPosts - publishedPosts, sub: "Awaiting publish", icon: "✏️", color: "#f43f5e" },
    { label: "Portfolio Items", value: totalPortfolio, sub: `${publishedPortfolio} live`, icon: "🎨", color: "#d4a853" },
    { label: "Draft Portfolio", value: totalPortfolio - publishedPortfolio, sub: "Not yet live", icon: "🖼️", color: "#7c3aed" },
  ];

  return (
    <div style={{ padding: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p className="section-label">Overview</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Welcome back 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
          Here&apos;s what&apos;s happening with your portal today.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              padding: "24px",
              borderLeft: `3px solid ${stat.color}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1, color: stat.color }}>
                  {stat.value}
                </p>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", marginTop: "6px" }}>{stat.label}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "4px" }}>
                  {stat.sub}
                </p>
              </div>
              <span style={{ fontSize: "1.8rem", opacity: 0.6 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "16px" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/posts/new" className="btn-primary">
            + New Post
          </Link>
          <Link href="/admin/portfolio/new" className="btn-secondary">
            + New Portfolio Item
          </Link>
          <Link href="/news" className="btn-ghost" target="_blank">
            View News Site ↗
          </Link>
          <Link href="/portfolio" className="btn-ghost" target="_blank">
            View Portfolio ↗
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontWeight: 700 }}>Recent Posts</h2>
          <Link href="/admin/posts" className="btn-ghost" style={{ fontSize: "0.8rem", padding: "8px 14px" }}>
            View All
          </Link>
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {recentPosts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              <p>No posts yet.</p>
              <Link href="/admin/posts/new" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
                Create your first post →
              </Link>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Title", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
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
                {recentPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="admin-table-row"
                  >
                    <td style={{ padding: "14px 20px", fontWeight: 500, fontSize: "0.9rem" }}>
                      {post.title}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span className={post.published ? "badge badge-published" : "badge badge-draft"}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="btn-ghost"
                        style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
