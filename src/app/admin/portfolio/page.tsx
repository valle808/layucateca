import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="section-label">Design Work</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Portfolio Items</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{items.length} item{items.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/admin/portfolio/new" className="btn-primary">+ New Item</Link>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {items.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎨</p>
            <p>No portfolio items yet.</p>
            <Link href="/admin/portfolio/new" className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
              Add First Item →
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Title", "Price", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="admin-table-row">
                  <td style={{ padding: "14px 20px", fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: "14px 20px", color: "var(--accent-gold)", fontWeight: 600 }}>
                    {item.price ? `$${item.price.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className={item.published ? "badge badge-published" : "badge badge-draft"}>
                      {item.published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/admin/portfolio/${item.id}/edit`} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>Edit</Link>
                      {item.published && (
                        <Link href={`/portfolio/${item.slug}`} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "6px 12px" }} target="_blank">View ↗</Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
