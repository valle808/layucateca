"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { defaultSkills, defaultAgents, type AgentSkill } from "@/lib/agent-orchestrator";

export default function SkillsAdminPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [skillsList, setSkillsList] = useState<AgentSkill[]>(defaultSkills);

  const categories = ["all", ...Array.from(new Set(defaultSkills.map((s) => s.category)))];

  const handleToggle = (skillId: string) => {
    setSkillsList((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const getAgentIcons = (agentIds: string[]) => {
    return agentIds.map((id) => {
      const agent = defaultAgents.find((a) => a.id === id);
      return agent ? { id, icon: agent.icon, name: agent.name } : { id, icon: "🤖", name: id };
    });
  };

  const filteredSkills = skillsList.filter((skill) => {
    if (activeTab !== "all" && skill.category !== activeTab) return false;
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
          {t("Registro de Habilidades de IA", "AI Skills Registry", "Habilidades de IA")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {t(
            "Habilita, deshabilita y audita los módulos funcionales utilizados por tus agentes autónomos.",
            "Enable, disable, and audit the functional modules utilized by your autonomous agents.",
            "K'ax, xak'al yéetel líik'sa'al u meyajil habilidades ya'ax na'at ti' a k'iinil."
          )}
        </p>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "32px",
          overflowX: "auto",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: activeTab === cat ? "rgba(255, 85, 0, 0.15)" : "transparent",
              border: `1px solid ${activeTab === cat ? "rgba(255, 85, 0, 0.3)" : "transparent"}`,
              color: activeTab === cat ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {cat === "all" ? t("Todas", "All", "Tuláakal") : cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {filteredSkills.map((skill) => {
          const agents = getAgentIcons(skill.agentIds);
          return (
            <div
              key={skill.id}
              className="glass-card skill-hover"
              style={{
                borderRadius: "16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                opacity: skill.enabled ? 1 : 0.6,
              }}
            >
              {/* Header: Name & Enable Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    {skill.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "var(--accent-gold)",
                      background: "rgba(255, 85, 0, 0.05)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      display: "inline-block",
                      marginTop: "6px",
                    }}
                  >
                    {skill.category}
                  </span>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(skill.id)}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: skill.enabled ? "var(--accent-gold)" : "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                    outline: "none",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      position: "absolute",
                      top: "3px",
                      left: skill.enabled ? "23px" : "3px",
                      transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              {/* Description */}
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
                {t(skill.description.es, skill.description.en, skill.description.my)}
              </p>

              {/* Connected Agents */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginTop: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  {t("Agentes Vinculados", "Connected Agents", "Ajwáantajob")}
                </span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {agents.map((agent) => (
                    <span
                      key={agent.id}
                      title={agent.name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        fontSize: "0.75rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span>{agent.icon}</span>
                      <span>{agent.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Usage Count Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                <span>{t("Estado:", "Status:", "Estado:")}</span>
                <span style={{ color: skill.enabled ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                  {skill.enabled ? t("Habilitado", "Enabled", "Habilitado") : t("Deshabilitado", "Disabled", "Deshabilitado")}
                </span>
                <span style={{ marginLeft: "auto" }}>
                  {t("Uso:", "Usage:", "Uso:")} <strong>{skill.usageCount}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .skill-hover:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 85, 0, 0.25) !important;
          box-shadow: 0 12px 40px rgba(255, 85, 0, 0.08) !important;
        }
      `}</style>
    </div>
  );
}
