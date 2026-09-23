import React from "react";

export function MetricCard({ title, value, unit, subtitle, alert = false, icon = "" }) {
  return (
    <div
      className={`bf-card animate-emergence ${alert ? "bf-card--left-magenta" : "bf-card--left-teal"}`}
      style={{
        padding: "1.25rem 1.4rem",
        flex: 1,
        minWidth: "200px",
        background: alert
          ? "linear-gradient(135deg, #FCEAEC 0%, #FFF 60%)"
          : "#FFFFFF",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: "0.82rem", color: "var(--bf-slate)", fontWeight: 600 }}>{title}</div>
        {icon && <span style={{ fontSize: "1.2rem" }}>{icon}</span>}
      </div>
      <div style={{
        fontSize: "1.9rem",
        fontWeight: 800,
        marginTop: "0.3rem",
        color: alert ? "var(--bf-magenta)" : "var(--bf-charcoal)",
        letterSpacing: "-0.02em",
      }}>
        {value}{" "}
        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--bf-slate)" }}>{unit}</span>
      </div>
      {subtitle && (
        <div style={{
          fontSize: "0.78rem",
          color: alert ? "var(--bf-magenta)" : "var(--bf-slate)",
          marginTop: "0.25rem",
          fontWeight: alert ? 600 : 400,
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
