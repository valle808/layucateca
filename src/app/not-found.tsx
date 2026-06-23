import Link from "next/link";



export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "96px 24px",
      textAlign: "center",
      background: "#0a0a0f",
      color: "#f8fafc",
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>
      <h2 style={{ marginBottom: "16px", fontSize: "2.5rem", fontWeight: 700, color: "#ef4444" }}>
        404 — Page Not Found
      </h2>
      <p style={{ marginBottom: "32px", fontSize: "1.1rem", color: "#94a3b8" }}>
        We could not find the page you were looking for.
      </p>
      <Link
        href="/"
        style={{
          borderRadius: "9999px",
          background: "#2563eb",
          padding: "12px 32px",
          color: "#fff",
          textDecoration: "none",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
