import React, { useState, useEffect } from "react";
import { Header } from "./components/common/Header";
import { AlertBanner } from "./components/common/AlertBanner";
import { DashboardPage } from "./pages/DashboardPage";
import { SafetyPage } from "./pages/SafetyPage";
import { TrainingPage } from "./pages/TrainingPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import {
  fetchTasks,
  fetchTelemetry,
  fetchAlerts,
  fetchTrainingModules,
  sendTelemetry,
  acknowledgeAlert,
} from "./services/api";

export function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [modules, setModules] = useState([]);

  // Load initial datasets from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [tData, telemData, aData, mData] = await Promise.all([
          fetchTasks().catch(() => []),
          fetchTelemetry().catch(() => []),
          fetchAlerts().catch(() => []),
          fetchTrainingModules().catch(() => []),
        ]);
        setTasks(tData);
        setTelemetry(telemData);
        setAlerts(aData);
        setModules(mData);
      } catch (err) {
        console.error("Failed loading data", err);
      }
    }
    loadData();
  }, []);

  const handleAddTask = (newTask) => {
    const taskRecord = {
      task_id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newTask,
      status: "Scheduled",
    };
    setTasks((prev) => [taskRecord, ...prev]);
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
    } catch {
      // Local fallback
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleSimulateTelemetry = async () => {
    const isIncident = Math.random() > 0.5;
    const mockTelemetry = {
      machine_id: "CAT-EX-320",
      operator_id: "OP-401",
      engine_hours: Number((1250 + Math.random() * 10).toFixed(1)),
      fuel_used_liters: Number((15 + Math.random() * 20).toFixed(1)),
      load_cycles: Math.floor(Math.random() * 25),
      idling_time_min: isIncident ? 52 : Math.floor(Math.random() * 30),
      seatbelt_status: isIncident ? "Unfastened" : "Fastened",
      proximity_distance_m: isIncident ? 1.8 : Number((4 + Math.random() * 6).toFixed(1)),
    };

    try {
      const saved = await sendTelemetry(mockTelemetry);
      setTelemetry((prev) => [...prev, saved]);
      const refreshedAlerts = await fetchAlerts();
      setAlerts(refreshedAlerts);
    } catch {
      // Offline fallback
      setTelemetry((prev) => [...prev, { ...mockTelemetry, timestamp: new Date().toISOString() }]);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeAlertsCount={activeAlerts.length}
      />

      <main style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        <AlertBanner alerts={activeAlerts} onAcknowledge={handleAcknowledge} />

        {currentView === "dashboard" && (
          <DashboardPage
            tasks={tasks}
            onAddTask={handleAddTask}
            telemetry={telemetry}
            alerts={alerts}
          />
        )}

        {currentView === "safety" && (
          <SafetyPage
            telemetry={telemetry}
            alerts={alerts}
            onAcknowledge={handleAcknowledge}
          />
        )}

        {currentView === "training" && <TrainingPage modules={modules} />}

        {currentView === "analytics" && (
          <AnalyticsPage
            telemetry={telemetry}
            onSimulateTelemetry={handleSimulateTelemetry}
          />
        )}
      </main>
    </div>
  );
}

export default App;

