import React from "react";

export function SafetyPanel({ telemetry = [], alerts = [], onAcknowledge }) {
  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>Safety & Proximity Hazards</h2>

      {/* Safety Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Seatbelt Status */}
        <div style={{
          backgroundColor: "#FFF",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          borderLeft: latest?.seatbelt_status === "Unfastened" ? "6px solid var(--cat-danger)" : "6px solid var(--cat-success)",
        }}>
          <h3>Seatbelt Compliance</h3>
          <div style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            marginTop: "0.5rem",
            color: latest?.seatbelt_status === "Unfastened" ? "var(--cat-danger)" : "var(--cat-success)",
          }}>
            {latest?.seatbelt_status || "No Telemetry"}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
            Mandatory continuous seatbelt sensor check.
          </p>
        </div>

        {/* Proximity Distance */}
        <div style={{
          backgroundColor: "#FFF",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          borderLeft: (latest?.proximity_distance_m || 10) < 3.0 ? "6px solid var(--cat-danger)" : "6px solid var(--cat-yellow)",
        }}>
          <h3>Proximity Radar</h3>
          <div style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            marginTop: "0.5rem",
            color: (latest?.proximity_distance_m || 10) < 3.0 ? "var(--cat-danger)" : "var(--cat-black)",
          }}>
            {latest ? `${latest.proximity_distance_m} m` : "—"}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
            Alert triggers when obstacle distance &lt; 3.0 meters.
          </p>
        </div>
      </div>

      {/* Incidents & Alerts Log */}
      <div style={{
        backgroundColor: "#FFF",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "1.25rem", borderBottom: "1px solid #EEE" }}>
          <h3 style={{ margin: 0 }}>Incident & Hazard Log</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#FAFAFA", borderBottom: "1px solid #EEE" }}>
            <tr>
              <th style={{ padding: "1rem" }}>Alert ID</th>
              <th style={{ padding: "1rem" }}>Severity</th>
              <th style={{ padding: "1rem" }}>Type</th>
              <th style={{ padding: "1rem" }}>Machine / Operator</th>
              <th style={{ padding: "1rem" }}>Message</th>
              <th style={{ padding: "1rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                  No active safety alerts. All systems operational.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id} style={{ borderBottom: "1px solid #EEE" }}>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{alert.id}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      backgroundColor: alert.severity === "Critical" ? "#FFCDD2" : "#FFE0B2",
                      color: alert.severity === "Critical" ? "var(--cat-danger)" : "#E65100",
                    }}>
                      {alert.severity}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>{alert.alert_type}</td>
                  <td style={{ padding: "1rem" }}>{alert.machine_id} ({alert.operator_id})</td>
                  <td style={{ padding: "1rem" }}>{alert.message}</td>
                  <td style={{ padding: "1rem" }}>
                    {alert.acknowledged ? (
                      <span style={{ color: "#888", fontSize: "0.85rem" }}>Acknowledged</span>
                    ) : (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        style={{
                          backgroundColor: "var(--cat-black)",
                          color: "#FFF",
                          border: "none",
                          padding: "0.3rem 0.6rem",
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

