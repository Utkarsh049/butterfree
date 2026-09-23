const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function fetchTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function estimateTaskTime(taskData) {
  const res = await fetch(`${API_BASE}/tasks/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error("Failed to estimate task time");
  return res.json();
}

export async function fetchTelemetry() {
  const res = await fetch(`${API_BASE}/telemetry`);
  if (!res.ok) throw new Error("Failed to fetch telemetry");
  return res.json();
}

export async function sendTelemetry(telemetry) {
  const res = await fetch(`${API_BASE}/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(telemetry),
  });
  if (!res.ok) throw new Error("Failed to ingest telemetry");
  return res.json();
}

export async function syncTelemetryBatch(records) {
  const res = await fetch(`${API_BASE}/telemetry/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: "frontend-offline-client", records }),
  });
  if (!res.ok) throw new Error("Failed to batch sync offline telemetry");
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function acknowledgeAlert(alertId) {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to acknowledge alert");
  return res.json();
}

export async function fetchMachineHealthScore(machineId = "CAT-EX-320") {
  const res = await fetch(`${API_BASE}/health-score/${machineId}`);
  if (!res.ok) throw new Error("Failed to fetch machine health score");
  return res.json();
}

export async function fetchTrainingModules() {
  const res = await fetch(`${API_BASE}/training/modules`);
  if (!res.ok) throw new Error("Failed to fetch training modules");
  return res.json();
}
