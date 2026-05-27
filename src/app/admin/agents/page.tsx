"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { defaultAgents, type AgentConfig } from "@/lib/agent-orchestrator";

export default function AgentsAdminPage() {
  const { t } = useLanguage();

  const totalAgents = defaultAgents.length;
  const activeAgents = defaultAgents.filter((a) => a.status === "active").length;
  const totalTasksInProgress = defaultAgents.reduce((sum, a) => sum + a.tasksInProgress, 0);
  const totalCost = defaultAgents.reduce((sum, a) => sum + a.costUsed, 0).toFixed(2);

  const getStatusBadge = (status: AgentConfig["status"]) => {
    switch (status) {
      case "active":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
                animation: "pulse-glow 1.5s infinite alternate",
              }}
            />
            {t("Activo", "Active", "Kuxa'an")}
          </span>
        );
      case "idle":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "12px",
              background: "rgba(156, 163, 175, 0.15)",
              color: "#9ca3af",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {t("Inactivo", "Idle", "Je'el")}
          </span>
        );
      case "paused":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#f59e0b",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {t("Pausado", "Paused", "Wa'atal")}
          </span>
        );
      case "error":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {t("Error", "Error", "K'aas")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "40px 24px", color: "var(--text-primary)" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("Orquestación de Agentes", "Agent Orchestration", "Nu'uktik Ajwáantajob")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {t(
            "Administra, supervisa y escala la fuerza laboral de IA de tu portal.",
            "Manage, monitor, and scale your portal's autonomous AI workforce.",
            "K'ax, xak'al yéetel líik'sa'al a meyajil ya'ax na'at ti' a wíinikil."
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {[
          { label: t("Agentes Totales", "Total Agents", "Tuláakal Ajwáantajob"), value: totalAgents, icon: "👥", color: "#3b82f6" },
          { label: t("Agentes Activos", "Active Agents", "Kuxa'an Meyajil"), value: activeAgents, icon: "⚡", color: "#10b981" },
          { label: t("Tareas en Progreso", "Tasks In Progress", "Meyajil ich beel"), value: totalTasksInProgress, icon: "🔄", color: "#f59e0b" },
          { label: t("Costo Mensual (USD)", "Monthly Cost (USD)", "Tojol U'ubal"), value: `$${totalCost}`, icon: "💰", color: "var(--accent-gold)" },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                {stat.label}
              </span>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "8px", color: "var(--text-primary)" }}>
                {stat.value}
              </h3>
            </div>
            <span style={{ fontSize: "2rem", filter: `drop-shadow(0 0 10px ${stat.color}50)` }}>
              {stat.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Grid List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {defaultAgents.map((agent) => {
          const budgetPercent = Math.min((agent.costUsed / agent.budgetLimit) * 100, 100);
          return (
            <div
              key={agent.id}
              className="glass-card agent-hover"
              style={{
                borderRadius: "16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
              }}
            >
              {/* Subtle top indicator glow */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: agent.status === "active" ? "#10b981" : agent.status === "paused" ? "#f59e0b" : "transparent",
                  opacity: 0.6,
                }}
              />

              {/* Icon & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "2.25rem", padding: "8px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {agent.icon}
                </span>
                {getStatusBadge(agent.status)}
              </div>

              {/* Name & Role */}
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  {agent.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-block", marginTop: "4px" }}>
                  {agent.role}
                </span>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "12px", lineHeight: "1.5" }}>
                  {t(agent.description.es, agent.description.en, agent.description.my)}
                </p>
              </div>

              {/* Model */}
              {agent.model && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                  <span>{t("Modelo:", "Model:", "Modelil:")}</span>
                  <span style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-primary)" }}>
                    {agent.model}
                  </span>
                </div>
              )}

              {/* Capabilities */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    style={{
                      fontSize: "0.7rem",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "rgba(255, 85, 0, 0.08)",
                      border: "1px solid rgba(255, 85, 0, 0.15)",
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* Budget Progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "6px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{t("Presupuesto", "Budget Limit", "Presupuesto")}</span>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    ${agent.costUsed.toFixed(2)} / ${agent.budgetLimit.toFixed(0)}
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${budgetPercent}%`,
                      height: "100%",
                      background: budgetPercent > 80 ? "#ef4444" : "linear-gradient(90deg, var(--accent-gold) 0%, #ff7700 100%)",
                      boxShadow: "0 0 10px rgba(255, 85, 0, 0.5)",
                      borderRadius: "3px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Task Counters */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", marginTop: "4px" }}>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>{t("Completado", "Done", "Completado")}</span>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0 0", color: "#10b981" }}>{agent.tasksCompleted}</h4>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>{t("En Progreso", "Active", "Meyajil")}</span>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0 0", color: "#f59e0b" }}>{agent.tasksInProgress}</h4>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>{t("Fallidos", "Failed", "K'aas")}</span>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0 0", color: "#ef4444" }}>{agent.tasksFailed}</h4>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .agent-hover:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 85, 0, 0.25) !important;
          box-shadow: 0 12px 40px rgba(255, 85, 0, 0.08), 0 0 30px rgba(255, 85, 0, 0.04) !important;
        }
      `}</style>
    </div>
  );
}
