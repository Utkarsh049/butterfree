import React from "react";
import { MetricCard } from "../components/common/MetricCard";
import { DailyTaskDashboard } from "../components/dashboard/DailyTaskDashboard";

export function DashboardPage({ tasks, onAddTask, telemetry, alerts }) {
  const completedTasks = tasks.filter((t) => t.actual_time_min).length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <MetricCard
          title="Scheduled Tasks"
          value={tasks.length}
          unit="tasks"
          subtitle={`${completedTasks} completed today`}
        />
        <MetricCard
          title="Active Machine Alerts"
          value={activeAlerts}
          unit="alerts"
          subtitle={activeAlerts > 0 ? "Requires attention" : "Normal status"}
          alert={activeAlerts > 0}
        />
        <MetricCard
          title="Latest Engine Hours"
          value={telemetry.length > 0 ? telemetry[telemetry.length - 1].engine_hours : 0}
          unit="hrs"
          subtitle="CAT-EX-320"
        />
        <MetricCard
          title="Average Idling"
          value={telemetry.length > 0 ? telemetry[telemetry.length - 1].idling_time_min : 0}
          unit="min"
          subtitle="Threshold: 45 min"
        />
      </div>

      <DailyTaskDashboard tasks={tasks} onAddTask={onAddTask} />
    </div>
  );
}

