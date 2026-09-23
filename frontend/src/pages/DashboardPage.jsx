import React from "react";
import { MetricCard } from "../components/common/MetricCard";
import { DailyTaskDashboard } from "../components/dashboard/DailyTaskDashboard";

export function DashboardPage({ tasks, onAddTask, telemetry, alerts, machineHealth }) {
  const completedTasks = tasks.filter((t) => t.actual_time_min).length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
  const latestTelem = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  const healthScore = machineHealth?.score ?? 92;
  const healthRating = machineHealth?.rating ?? "Optimal";
  const serviceHoursRemaining = machineHealth?.service_hours_remaining ?? 120;

  return (
    <div>
      {/* Metric Cards Row */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {/* Digital Twin Machine Health Card */}
        <div style={{
          backgroundColor: "#FFF",
          padding: "1.25rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          borderLeft: healthScore >= 85 ? "5px solid #2E7D32" : healthScore >= 65 ? "5px solid var(--cat-warning)" : "5px solid var(--cat-danger)",
          flex: 1.2,
          minWidth: "240px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "#666", fontWeight: 700 }}>Machine Health (Digital Twin)</span>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: healthScore >= 85 ? "#E8F5E9" : "#FFF3E0",
              color: healthScore >= 85 ? "#2E7D32" : "var(--cat-warning)",
            }}>
              {healthRating}
            </span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", color: healthScore >= 85 ? "#2E7D32" : "var(--cat-warning)" }}>
            {healthScore} <span style={{ fontSize: "1rem", color: "#666", fontWeight: 500 }}>/ 100</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
            Next service due in <strong>{serviceHoursRemaining} hrs</strong>
          </div>
        </div>

        <MetricCard
          title="Scheduled Tasks"
          value={tasks.length}
          unit="tasks"
          subtitle={`${completedTasks} completed today`}
        />

        <MetricCard
          title="Operator Streak"
          value={latestTelem?.continuous_run_hours ?? 1.2}
          unit="hrs"
          subtitle={(latestTelem?.continuous_run_hours ?? 1.2) >= 3.0 ? "⚠️ Rest break due" : "Normal alertness"}
          alert={(latestTelem?.continuous_run_hours ?? 1.2) >= 3.0}
        />

        <MetricCard
          title="Active Machine Alerts"
          value={activeAlerts}
          unit="alerts"
          subtitle={activeAlerts > 0 ? "Requires attention" : "Normal status"}
          alert={activeAlerts > 0}
        />
      </div>

      <DailyTaskDashboard tasks={tasks} onAddTask={onAddTask} />
    </div>
  );
}
