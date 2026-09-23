import React, { useState } from "react";
import { TASK_TYPES, WEATHER_TYPES, SKILL_LEVELS } from "../../types";
import { estimateTaskTime } from "../../services/api";

export function DailyTaskDashboard({ tasks = [], onAddTask }) {
  const [taskType, setTaskType] = useState(TASK_TYPES[0]);
  const [weather, setWeather] = useState(WEATHER_TYPES[0]);
  const [operatorSkill, setOperatorSkill] = useState(SKILL_LEVELS[1]);
  const [machineAge, setMachineAge] = useState(3);
  const [predictedTime, setPredictedTime] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const handlePredict = async () => {
    try {
      setLoadingEstimate(true);
      const res = await estimateTaskTime({
        task_type: taskType,
        weather,
        operator_skill: operatorSkill,
        machine_age_years: Number(machineAge),
      });
      setPredictedTime(res.predicted_time_min);
    } catch (err) {
      console.error("Estimation failed", err);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleCreate = () => {
    if (!predictedTime) return;
    onAddTask({
      task_type: taskType,
      weather,
      operator_skill: operatorSkill,
      machine_age_years: Number(machineAge),
      estimated_time_min: Math.round(predictedTime),
    });
    setPredictedTime(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>Daily Task Dashboard</h2>
      </div>

      {/* Task Estimation & Creation Card */}
      <div style={{
        backgroundColor: "#FFF",
        padding: "1.5rem",
        borderRadius: "8px",
        marginBottom: "2rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }}>
        <h3 style={{ marginBottom: "1rem" }}>Schedule New Task (ML Time Estimation)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #CCC" }}
            >
              {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>Weather</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #CCC" }}
            >
              {WEATHER_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>Operator Skill</label>
            <select
              value={operatorSkill}
              onChange={(e) => setOperatorSkill(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #CCC" }}
            >
              {SKILL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>Machine Age (Yrs)</label>
            <input
              type="number"
              min="0"
              max="25"
              value={machineAge}
              onChange={(e) => setMachineAge(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #CCC" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={handlePredict}
            disabled={loadingEstimate}
            style={{
              backgroundColor: "var(--cat-black)",
              color: "#FFF",
              padding: "0.6rem 1.2rem",
              border: "none",
            }}
          >
            {loadingEstimate ? "Calculating ML..." : "Estimate Duration"}
          </button>

          {predictedTime !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                Predicted: <span style={{ color: "var(--cat-warning)" }}>{predictedTime} mins</span>
              </span>
              <button
                onClick={handleCreate}
                style={{
                  backgroundColor: "var(--cat-yellow)",
                  color: "var(--cat-black)",
                  padding: "0.6rem 1.2rem",
                  border: "none",
                }}
              >
                Schedule Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div style={{
        backgroundColor: "#FFF",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#FAFAFA", borderBottom: "1px solid #EEE" }}>
            <tr>
              <th style={{ padding: "1rem" }}>Task ID</th>
              <th style={{ padding: "1rem" }}>Type</th>
              <th style={{ padding: "1rem" }}>Weather</th>
              <th style={{ padding: "1rem" }}>Skill</th>
              <th style={{ padding: "1rem" }}>Est. Time</th>
              <th style={{ padding: "1rem" }}>Actual Time</th>
              <th style={{ padding: "1rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.task_id} style={{ borderBottom: "1px solid #EEE" }}>
                <td style={{ padding: "1rem", fontWeight: 600 }}>{task.task_id}</td>
                <td style={{ padding: "1rem" }}>{task.task_type}</td>
                <td style={{ padding: "1rem" }}>{task.weather}</td>
                <td style={{ padding: "1rem" }}>{task.operator_skill}</td>
                <td style={{ padding: "1rem" }}>{task.estimated_time_min} min</td>
                <td style={{ padding: "1rem" }}>{task.actual_time_min ? `${task.actual_time_min} min` : "—"}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    backgroundColor: task.actual_time_min ? "#E8F5E9" : "#FFF9C4",
                    color: task.actual_time_min ? "#2E7D32" : "#F57F17",
                  }}>
                    {task.status || (task.actual_time_min ? "Completed" : "Scheduled")}
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

