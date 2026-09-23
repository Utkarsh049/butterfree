import React from "react";

export function AnomalyFeed({ telemetry = [], onSimulateTelemetry }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>Machine Telemetry & Anomaly Detection</h2>
        <button
          onClick={onSimulateTelemetry}
          style={{
            backgroundColor: "var(--cat-black)",
            color: "var(--cat-yellow)",
            border: "none",
            padding: "0.6rem 1.2rem",
          }}
        >
          + Simulate Telemetry Ping
        </button>
      </div>

      <div style={{
        backgroundColor: "#FFF",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#FAFAFA", borderBottom: "1px solid #EEE" }}>
            <tr>
              <th style={{ padding: "1rem" }}>Timestamp</th>
              <th style={{ padding: "1rem" }}>Machine</th>
              <th style={{ padding: "1rem" }}>Operator</th>
              <th style={{ padding: "1rem" }}>Engine Hrs</th>
              <th style={{ padding: "1rem" }}>Fuel (L)</th>
              <th style={{ padding: "1rem" }}>Cycles</th>
              <th style={{ padding: "1rem" }}>Idling (min)</th>
              <th style={{ padding: "1rem" }}>Seatbelt</th>
              <th style={{ padding: "1rem" }}>Alert Triggered</th>
            </tr>
          </thead>
          <tbody>
            {telemetry.map((t, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #EEE" }}>
                <td style={{ padding: "1rem", fontSize: "0.85rem" }}>
                  {new Date(t.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ padding: "1rem", fontWeight: 600 }}>{t.machine_id}</td>
                <td style={{ padding: "1rem" }}>{t.operator_id}</td>
                <td style={{ padding: "1rem" }}>{t.engine_hours}</td>
                <td style={{ padding: "1rem" }}>{t.fuel_used_liters} L</td>
                <td style={{ padding: "1rem" }}>{t.load_cycles}</td>
                <td style={{
                  padding: "1rem",
                  color: t.idling_time_min > 45 ? "var(--cat-danger)" : "inherit",
                  fontWeight: t.idling_time_min > 45 ? 700 : "normal",
                }}>
                  {t.idling_time_min} min {t.idling_time_min > 45 && "⚠️"}
                </td>
                <td style={{ padding: "1rem" }}>{t.seatbelt_status}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    backgroundColor: t.safety_alert_triggered ? "#FFCDD2" : "#E8F5E9",
                    color: t.safety_alert_triggered ? "var(--cat-danger)" : "var(--cat-success)",
                  }}>
                    {t.safety_alert_triggered ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

