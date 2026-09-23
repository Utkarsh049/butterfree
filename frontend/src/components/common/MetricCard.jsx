import React from "react";

export function MetricCard({ title, value, unit, subtitle, alert = false }) {
  return (
    <div style={{
      backgroundColor: "#FFF",
      padding: "1.25rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      borderLeft: alert ? "5px solid var(--cat-danger)" : "5px solid var(--cat-yellow)",
      flex: 1,
      minWidth: "200px",
    }}>
      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "0.25rem" }}>
        {value} <span style={{ fontSize: "1rem", fontWeight: 500, color: "#666" }}>{unit}</span>
      </div>
      {subtitle && <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>{subtitle}</div>}
    </div>
  );
}

