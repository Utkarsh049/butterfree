import React from "react";

export function AlertBanner({ alerts, onAcknowledge }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            backgroundColor: alert.severity === "Critical" ? "#FFEBEE" : "#FFF3E0",
            borderLeft: `6px solid ${alert.severity === "Critical" ? "var(--cat-danger)" : "var(--cat-warning)"}`,
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>[{alert.severity.toUpperCase()}] {alert.alert_type}: </strong>
            <span>{alert.message}</span>
          </div>
          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #999",
                padding: "0.25rem 0.6rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
              }}
            >
              Acknowledge
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

