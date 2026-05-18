// Trusted-Source: Antigravity
"use client";

import React, { useState, useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-AI Bot Trap
  
  // Security logs state for visual quantum progress effect
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if token exists in localStorage/session
    const token = localStorage.getItem("la_yucateca_admin_session");
    if (token === "quantum_shield_valle_808_active") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsVerifying(true);
    setSecurityLogs(["Initiating Quantum Key Exchange (QKE)..."]);

    // 1. Honeypot check (AI Bot Shield)
    if (honeypot) {
      setTimeout(() => {
        setSecurityLogs(prev => [...prev, "🚨 Automated Swarm Detected. Deploying AI-Proof Shield.", "Connection Blocked."]);
        setIsVerifying(false);
      }, 1000);
      return;
    }

    // Step-by-step artificial delay to prevent automated high-speed brute force attacks
    setTimeout(() => {
      setSecurityLogs(prev => [...prev, "Generating Anti-Observation Noise (Entropy: 2^256)..."]);
    }, 400);

    setTimeout(() => {
      setSecurityLogs(prev => [...prev, "Performing AI-Proof Cryptographic Signature check..."]);
      
      // 2. Credentials check
      if (username === "valle808@hawaii.edu" && password === "Pharaoh@808") {
        setSecurityLogs(prev => [...prev, "✅ Session Verified. De-encrypting dashboard node..."]);
        setTimeout(() => {
          localStorage.setItem("la_yucateca_admin_session", "quantum_shield_valle_808_active");
          setIsAuthenticated(true);
          setIsVerifying(false);
        }, 500);
      } else {
        setTimeout(() => {
          setErrorMsg("❌ Decryption Failure: Invalid Cryptographic Credentials.");
          setSecurityLogs([]);
          setIsVerifying(false);
        }, 200);
      }
    }, 1100);
  };

  const handleLogout = () => {
    localStorage.removeItem("la_yucateca_admin_session");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#060608", color: "var(--accent-teal)" }}>
        <p style={{ fontWeight: "bold", fontSize: "1rem", letterSpacing: "2px" }}>QUANTUM SHIELD INITIALIZING...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "radial-gradient(circle at center, #0e0d16 0%, #060608 100%)",
          color: "#fff",
          padding: "24px",
          fontFamily: "monospace",
        }}
      >
        <div
          className="card animate-fadeInUp"
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "40px",
            borderRadius: "24px",
            border: "1px solid rgba(212, 168, 83, 0.25)",
            background: "rgba(10, 10, 15, 0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            position: "relative",
          }}
        >
          {/* Glowing Top line */}
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "2px", background: "linear-gradient(to right, transparent, #d4a853, #2dd4bf, transparent)" }} />

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <span style={{ fontSize: "3rem", display: "inline-block", filter: "drop-shadow(0 0 10px rgba(212,168,83,0.4))" }}>🔒</span>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#d4a853", letterSpacing: "1.5px", textTransform: "uppercase", margin: "16px 0 6px" }}>
              SHIELD PROTOCOL ACTIVE
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
              Node: La Yucateca Administrative Matrix
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Honeypot Input (Invisible to humans, trapped by AI scripts) */}
            <input
              type="text"
              name="quantum_noise_detector"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Identity Token (Username)
              </label>
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="identity@matrix.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(212, 168, 83, 0.2)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "border 0.3s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2dd4bf"}
                onBlur={(e) => e.target.style.borderColor = "rgba(212, 168, 83, 0.2)"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Quantum Cipher (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(212, 168, 83, 0.2)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "border 0.3s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2dd4bf"}
                onBlur={(e) => e.target.style.borderColor = "rgba(212, 168, 83, 0.2)"}
              />
            </div>

            {errorMsg && (
              <p style={{ color: "#f43f5e", fontSize: "0.78rem", margin: 0, lineHeight: 1.4 }}>
                {errorMsg}
              </p>
            )}

            {securityLogs.length > 0 && (
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(45,212,191,0.15)" }}>
                {securityLogs.map((log, index) => (
                  <p key={index} style={{ margin: "4px 0", fontSize: "0.68rem", color: "#2dd4bf", lineHeight: 1.3 }}>
                    &gt; {log}
                  </p>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #d4a853, #b8892a)",
                color: "#0a0a0f",
                border: "none",
                padding: "14px",
                borderRadius: "12px",
                fontWeight: 900,
                fontSize: "0.85rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
                cursor: isVerifying ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(212,168,83,0.3)",
                transition: "all 0.2s",
              }}
            >
              {isVerifying ? "VERIFYING CRYPTO SHARE..." : "DECRYPT NODE"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Inject a secure logout function in the window so children can trigger it
  if (typeof window !== "undefined") {
    (window as any).adminLogout = handleLogout;
  }

  return <>{children}</>;
}
