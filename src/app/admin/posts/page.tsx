import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function AdminPostsPage() {
  const { data: postsData } = await supabase
    .from('Post')
    .select('*')
    .order('createdAt', { ascending: false });
  const posts = postsData || [];

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="section-label">Content</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>All Posts</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            {posts.length} article{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          + New Post
        </Link>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {posts.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📰</p>
            <p>No posts yet. Create your first article!</p>
            <Link href="/admin/posts/new" className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
              Create Post →
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Title", "Slug", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="admin-table-row"
                >
                  <td style={{ padding: "14px 20px", fontWeight: 600 }}>{post.title}</td>
                  <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "monospace" }}>{post.slug}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className={post.published ? "badge badge-published" : "badge badge-draft"}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/admin/posts/${post.id}/edit`} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
                        Edit
                      </Link>
                      {post.published && (
                        <Link href={`/news/${post.slug}`} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "6px 12px" }} target="_blank">
                          View ↗
                        </Link>
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
