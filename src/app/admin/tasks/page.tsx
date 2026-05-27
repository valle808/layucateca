"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { defaultTasks, defaultAgents, type AgentTask } from "@/lib/agent-orchestrator";

export default function TasksAdminPage() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const getAgentInfo = (agentId: string) => {
    const agent = defaultAgents.find((a) => a.id === agentId);
    return agent ? { name: agent.name, icon: agent.icon } : { name: agentId, icon: "🤖" };
  };

  const getStatusBadge = (status: AgentTask["status"]) => {
    const styles: Record<AgentTask["status"], { bg: string; color: string; border: string }> = {
      queued: { bg: "rgba(156, 163, 175, 0.15)", color: "#9ca3af", border: "rgba(156, 163, 175, 0.2)" },
      in_progress: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.2)" },
      completed: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "rgba(16, 185, 129, 0.2)" },
      failed: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "rgba(239, 68, 68, 0.2)" },
      blocked: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", border: "rgba(139, 92, 246, 0.2)" },
    };

    const style = styles[status] || styles.queued;
    const label = {
      queued: t("En cola", "Queued", "Cola"),
      in_progress: t("En progreso", "In Progress", "Meyajil"),
      completed: t("Completado", "Completed", "Completado"),
      failed: t("Fallido", "Failed", "K'aas"),
      blocked: t("Bloqueado", "Blocked", "Blocked"),
    }[status];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 10px",
          borderRadius: "8px",
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority: AgentTask["priority"]) => {
    const colors: Record<AgentTask["priority"], string> = {
      low: "#10b981",
      medium: "#3b82f6",
      high: "#f59e0b",
      critical: "#ef4444",
    };

    const color = colors[priority] || colors.medium;
    const label = {
      low: t("Baja", "Low", "Baja"),
      medium: t("Media", "Medium", "Media"),
      high: t("Alta", "High", "Alta"),
      critical: t("Crítica", "Critical", "Crítica"),
    }[priority];

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-primary)" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
        {label}
      </span>
    );
  };

  const filteredTasks = defaultTasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (agentFilter !== "all" && task.agentId !== agentFilter) return false;
    return true;
  });

  return (
    <div style={{ padding: "40px 24px", color: "var(--text-primary)" }}>
      {/* Header */}
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
          {t("Gestor de Tareas Autónomas", "Autonomous Task Manager", "Meyajil Tareas")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {t(
            "Monitorea el flujo de trabajo de los agentes de IA en tiempo real.",
            "Monitor the workflow of AI agents in real-time.",
            "Xak'al yéetel líik'sa'al u meyajil ya'ax na'at ti' a k'iinil."
          )}
        </p>
      </div>

      {/* Filter Controls */}
      <div
        className="glass-card"
        style={{
          padding: "20px 24px",
          borderRadius: "16px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "30px",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {t("Filtrar por:", "Filter by:", "Filtro:")}
        </span>

        {/* Agent Filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">{t("Todos los agentes", "All Agents", "Tuláakal")}</option>
            {defaultAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">{t("Todos los estados", "All Statuses", "Tuláakal")}</option>
            <option value="queued">{t("En cola", "Queued", "Cola")}</option>
            <option value="in_progress">{t("En progreso", "In Progress", "Meyajil")}</option>
            <option value="completed">{t("Completado", "Completed", "Completado")}</option>
            <option value="failed">{t("Fallido", "Failed", "K'aas")}</option>
            <option value="blocked">{t("Bloqueado", "Blocked", "Blocked")}</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">{t("Todas las prioridades", "All Priorities", "Tuláakal")}</option>
            <option value="low">{t("Baja", "Low", "Baja")}</option>
            <option value="medium">{t("Media", "Medium", "Media")}</option>
            <option value="high">{t("Alta", "High", "Alta")}</option>
            <option value="critical">{t("Crítica", "Critical", "Crítica")}</option>
          </select>
        </div>
      </div>

      {/* Task List/Table */}
      <div
        className="glass-card"
        style={{
          borderRadius: "16px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        {filteredTasks.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "12px" }}>🔍</span>
            {t("No se encontraron tareas con los filtros actuales.", "No tasks found with the current filters.", "Ma'alob tareas ti' a filtro.")}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.02)" }}>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("ID / Tarea", "ID / Task", "Tarea")}
                  </th>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Agente Asignado", "Assigned Agent", "Ajwáantaj")}
                  </th>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Prioridad", "Priority", "Prioridad")}
                  </th>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Estado", "Status", "Estado")}
                  </th>
                  <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Última Actualización", "Last Updated", "U'ubal")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const agentInfo = getAgentInfo(task.agentId);
                  return (
                    <tr
                      key={task.id}
                      className="task-table-row"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background 0.2s ease",
                      }}
                    >
                      {/* ID / Title */}
                      <td style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--accent-gold)", fontWeight: 700 }}>
                            {task.id.toUpperCase()}
                          </span>
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {t(task.title.es, task.title.en, task.title.my)}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {task.description}
                          </span>
                        </div>
                      </td>

                      {/* Agent */}
                      <td style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "1.25rem", padding: "4px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            {agentInfo.icon}
                          </span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>
                            {agentInfo.name}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: "20px 24px" }}>
                        {getPriorityBadge(task.priority)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "20px 24px" }}>
                        {getStatusBadge(task.status)}
                      </td>

                      {/* Last Updated */}
                      <td style={{ padding: "20px 24px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {new Date(task.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        .task-table-row:hover {
          background: rgba(255, 85, 0, 0.02) !important;
        }
      `}</style>
    </div>
  );
}
