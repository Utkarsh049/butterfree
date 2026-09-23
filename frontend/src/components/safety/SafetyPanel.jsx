import React from "react";

export function SafetyPanel({ telemetry = [], alerts = [], onAcknowledge, onTakeBreak }) {
  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const continuousHours = latest?.continuous_run_hours ?? 1.2;

  // Fatigue status badge
  let fatigueStatus = "Optimal Alertness";
  let fatigueColor = "var(--cat-success)";
  let fatigueBorder = "#2E7D32";

  if (continuousHours >= 4.5) {
    fatigueStatus = "High Fatigue Risk";
    fatigueColor = "var(--cat-danger)";
    fatigueBorder = "var(--cat-danger)";
  } else if (continuousHours >= 3.0) {
    fatigueStatus = "Break Recommended";
    fatigueColor = "var(--cat-warning)";
    fatigueBorder = "var(--cat-warning)";
  }

  const fatigueAlerts = alerts.filter(
    (a) =>
      !a.acknowledged &&
      (a.alert_type === "Operator Rest Break Nudge" || a.alert_type === "Fatigue & Drowsiness Warning")
  );

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>Safety, Proximity & Operator Wellness</h2>

      {/* Operator Fatigue Nudge Banner if active */}
      {fatigueAlerts.length > 0 && (
        <div style={{
          backgroundColor: "#FFF8E1",
          border: "2px solid #FFC107",
          borderLeft: "8px solid #FF9800",
          borderRadius: "8px",
          padding: "1rem 1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#E65100" }}>
              ☕ Operator Rest & Hydration Nudge
            </div>
            <div style={{ fontSize: "0.9rem", color: "#5D4037", marginTop: "0.25rem" }}>
              {fatigueAlerts[0].message}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => onTakeBreak ? onTakeBreak() : onAcknowledge(fatigueAlerts[0].id)}
              style={{
                backgroundColor: "#FF9800",
                color: "#FFF",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              Take 15-Min Break
            </button>
            <button
              onClick={() => onAcknowledge(fatigueAlerts[0].id)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #CCC",
                padding: "0.5rem 0.8rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Safety Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Operator Fatigue & Continuous Hours Streak */}
        <div style={{
          backgroundColor: "#FFF",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          borderLeft: `6px solid ${fatigueBorder}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Operator Fatigue & Streak</h3>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: fatigueColor === "var(--cat-success)" ? "#E8F5E9" : "#FFF3E0",
              color: fatigueColor,
            }}>
              {fatigueStatus}
            </span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem", color: fatigueColor }}>
            {continuousHours} <span style={{ fontSize: "1rem", color: "#666", fontWeight: 500 }}>hrs continuous</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
            Infers physical exhaustion from continuous operation without pause. Nudge triggers at 3.0 hrs.
          </p>
        </div>

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
            fontSize: "2rem",
            fontWeight: 800,
            marginTop: "0.5rem",
            color: latest?.seatbelt_status === "Unfastened" ? "var(--cat-danger)" : "var(--cat-success)",
          }}>
            {latest?.seatbelt_status || "Fastened"}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
            Mandatory real-time cabin switch interlock check.
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
            fontSize: "2rem",
            fontWeight: 800,
            marginTop: "0.5rem",
            color: (latest?.proximity_distance_m || 10) < 3.0 ? "var(--cat-danger)" : "var(--cat-black)",
          }}>
            {latest ? `${latest.proximity_distance_m} m` : "8.5 m"}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
            Collision avoidance threshold: &lt; 3.0 meters triggers high-priority alert.
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
          <h3 style={{ margin: 0 }}>Incident, Hazard & Rest Log</h3>
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
                      backgroundColor: alert.severity === "Critical" ? "#FFCDD2" : alert.severity === "High" ? "#FFE0B2" : "#FFF9C4",
                      color: alert.severity === "Critical" ? "var(--cat-danger)" : "#E65100",
                    }}>
                      {alert.severity}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 500 }}>{alert.alert_type}</td>
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
