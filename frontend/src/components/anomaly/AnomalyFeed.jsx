import React from "react";

export function AnomalyFeed({ telemetry = [], machineHealth, onSimulateTelemetry }) {
  const health = machineHealth || {
    machine_id: "CAT-EX-320",
    score: 92,
    rating: "Optimal",
    idle_ratio_pct: 12.5,
    fuel_burn_rate_lph: 15.2,
    service_hours_remaining: 120.0,
    subscores: { idle_efficiency: 95, fuel_system: 90, service_schedule: 92, hydraulics: 90 },
    recommended_action: "All systems green. Normal preventative inspection scheduled.",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Digital Twin & Telemetry Diagnostics</h2>
          <p style={{ margin: "0.25rem 0 0 0", color: "#666", fontSize: "0.85rem" }}>
            Predictive maintenance index aggregates idle ratios, fuel burn, service schedules, and load stresses.
          </p>
        </div>
        <button
          onClick={onSimulateTelemetry}
          style={{
            backgroundColor: "var(--cat-black)",
            color: "var(--cat-yellow)",
            border: "none",
            padding: "0.6rem 1.2rem",
            fontWeight: 700,
          }}
        >
          + Simulate Telemetry Ping
        </button>
      </div>

      {/* Machine Health Score Breakdown Panel */}
      <div style={{
        backgroundColor: "#FFF",
        padding: "1.5rem",
        borderRadius: "8px",
        marginBottom: "2rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        borderTop: "4px solid #2E7D32",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ margin: 0 }}>CAT 320 Digital Twin — Health Index</h3>
            <div style={{ fontSize: "0.85rem", color: "#666" }}>Machine ID: {health.machine_id}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              fontSize: "1.8rem",
              fontWeight: 900,
              color: health.score >= 85 ? "#2E7D32" : health.score >= 65 ? "var(--cat-warning)" : "var(--cat-danger)",
            }}>
              {health.score} / 100
            </span>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#666" }}>Status: {health.rating}</div>
          </div>
        </div>

        {/* Subsystem Subscores */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ backgroundColor: "var(--cat-light-gray)", padding: "0.8rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>Idle Efficiency (30%)</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{health.subscores?.idle_efficiency ?? 95} / 100</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>{health.idle_ratio_pct}% idle ratio</div>
          </div>

          <div style={{ backgroundColor: "var(--cat-light-gray)", padding: "0.8rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>Fuel Burn System (25%)</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{health.subscores?.fuel_system ?? 90} / 100</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>{health.fuel_burn_rate_lph} L / hour</div>
          </div>

          <div style={{ backgroundColor: "var(--cat-light-gray)", padding: "0.8rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>Service Schedule (25%)</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{health.subscores?.service_schedule ?? 92} / 100</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>{health.service_hours_remaining}h to 250h check</div>
          </div>

          <div style={{ backgroundColor: "var(--cat-light-gray)", padding: "0.8rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>Mechanical / Cycles (20%)</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{health.subscores?.hydraulics ?? 90} / 100</div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>Optimal load frequency</div>
          </div>
        </div>

        {/* Action Recommendation */}
        <div style={{
          backgroundColor: "#E8F5E9",
          padding: "0.8rem 1.2rem",
          borderRadius: "6px",
          borderLeft: "4px solid #2E7D32",
          fontSize: "0.9rem",
          color: "#1B5E20",
        }}>
          🔧 <strong>Predictive Maintenance Advisory:</strong> {health.recommended_action}
        </div>
      </div>

      {/* Telemetry Stream */}
      <div style={{
        backgroundColor: "#FFF",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "1.25rem", borderBottom: "1px solid #EEE" }}>
          <h3 style={{ margin: 0 }}>Raw Machine Telemetry Feed</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#FAFAFA", borderBottom: "1px solid #EEE" }}>
            <tr>
              <th style={{ padding: "1rem" }}>Timestamp</th>
              <th style={{ padding: "1rem" }}>Machine</th>
              <th style={{ padding: "1rem" }}>Operator</th>
              <th style={{ padding: "1rem" }}>Engine Hrs</th>
              <th style={{ padding: "1rem" }}>Continuous Streak</th>
              <th style={{ padding: "1rem" }}>Fuel (L)</th>
              <th style={{ padding: "1rem" }}>Cycles</th>
              <th style={{ padding: "1rem" }}>Idling (min)</th>
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
                <td style={{
                  padding: "1rem",
                  color: (t.continuous_run_hours ?? 0) >= 3.0 ? "var(--cat-warning)" : "inherit",
                  fontWeight: (t.continuous_run_hours ?? 0) >= 3.0 ? 700 : "normal",
                }}>
                  {t.continuous_run_hours ?? 1.2} hrs {(t.continuous_run_hours ?? 0) >= 3.0 && "☕"}
                </td>
                <td style={{ padding: "1rem" }}>{t.fuel_used_liters} L</td>
                <td style={{ padding: "1rem" }}>{t.load_cycles}</td>
                <td style={{
                  padding: "1rem",
                  color: t.idling_time_min > 45 ? "var(--cat-danger)" : "inherit",
                  fontWeight: t.idling_time_min > 45 ? 700 : "normal",
                }}>
                  {t.idling_time_min} min {t.idling_time_min > 45 && "⚠️"}
                </td>
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
