import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/common/Header";
import { AlertBanner } from "./components/common/AlertBanner";
import { DashboardPage } from "./pages/DashboardPage";
import { SafetyPage } from "./pages/SafetyPage";
import { TrainingPage } from "./pages/TrainingPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { LedgerPage } from "./pages/LedgerPage";
import { DrowsinessPage } from "./pages/DrowsinessPage";
import {
  fetchTasks,
  fetchTelemetry,
  fetchAlerts,
  fetchTrainingModules,
  fetchMachineHealthScore,
  fetchLedger,
  sendTelemetry,
  syncTelemetryBatch,
  acknowledgeAlert,
} from "./services/api";

const OFFLINE_QUEUE_KEY = "cat_offline_telemetry_queue";
const CACHED_TASKS_KEY = "cat_cached_tasks";

export function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [modules, setModules] = useState([]);
  const [machineHealth, setMachineHealth] = useState(null);
  const [ledgerChain, setLedgerChain] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // ── Load queued offline telemetry from localStorage ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) setOfflineQueue(JSON.parse(stored));
      const cached = localStorage.getItem(CACHED_TASKS_KEY);
      if (cached && tasks.length === 0) setTasks(JSON.parse(cached));
    } catch (e) {
      console.error("Local storage load error", e);
    }
  }, []);

  const updateOfflineQueue = (newQueue) => {
    setOfflineQueue(newQueue);
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (e) {
      console.error("Failed saving offline queue", e);
    }
  };

  // ── Refresh ledger from backend ──
  const refreshLedger = useCallback(async () => {
    try {
      const chain = await fetchLedger();
      setLedgerChain(chain);
    } catch {
      // silently ignore — ledger displays existing state
    }
  }, []);

  // ── Sync offline records to backend ──
  const handleSyncOffline = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    try {
      await syncTelemetryBatch(offlineQueue);
      updateOfflineQueue([]);
      const [telemData, alertData, healthData, chain] = await Promise.all([
        fetchTelemetry().catch(() => []),
        fetchAlerts().catch(() => []),
        fetchMachineHealthScore().catch(() => null),
        fetchLedger().catch(() => ledgerChain),
      ]);
      if (telemData.length) setTelemetry(telemData);
      if (alertData.length) setAlerts(alertData);
      if (healthData) setMachineHealth(healthData);
      setLedgerChain(chain);
    } catch (err) {
      console.warn("Sync failed, will retry next online event", err);
    }
  }, [offlineQueue, ledgerChain]);

  // ── Online / Offline listeners ──
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); handleSyncOffline(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleSyncOffline]);

  // ── Initial data load ──
  useEffect(() => {
    async function loadData() {
      try {
        const [tData, telemData, aData, mData, healthData, chain] = await Promise.all([
          fetchTasks().catch(() => []),
          fetchTelemetry().catch(() => []),
          fetchAlerts().catch(() => []),
          fetchTrainingModules().catch(() => []),
          fetchMachineHealthScore().catch(() => null),
          fetchLedger().catch(() => []),
        ]);
        if (tData.length > 0) {
          setTasks(tData);
          localStorage.setItem(CACHED_TASKS_KEY, JSON.stringify(tData));
        }
        setTelemetry(telemData);
        setAlerts(aData);
        setModules(mData);
        setMachineHealth(healthData);
        setLedgerChain(chain);
      } catch (err) {
        console.error("Failed loading data", err);
      }
    }
    loadData();
  }, []);

  // ── Handlers ──
  const handleAddTask = (newTask) => {
    const taskRecord = {
      task_id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newTask,
      status: "Scheduled",
    };
    const updated = [taskRecord, ...tasks];
    setTasks(updated);
    try { localStorage.setItem(CACHED_TASKS_KEY, JSON.stringify(updated)); } catch { }
  };

  const handleAcknowledge = async (alertId) => {
    try { await acknowledgeAlert(alertId); } catch { }
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  };

  const handleTakeBreak = () => {
    if (telemetry.length > 0) {
      const latest = telemetry[telemetry.length - 1];
      setTelemetry((prev) => [...prev, { ...latest, continuous_run_hours: 0.0, timestamp: new Date().toISOString() }]);
    }
    setAlerts((prev) =>
      prev.map((a) =>
        a.alert_type === "Operator Rest Break Nudge" || a.alert_type === "Fatigue & Drowsiness Warning"
          ? { ...a, acknowledged: true }
          : a
      )
    );
  };

  // ── Drowsiness alert from webcam AI ──
  const handleDrowsinessAlert = useCallback((earValue) => {
    const syntheticAlert = {
      id: `ALT-DRW-FE-${Date.now().toString(16).slice(-6)}`,
      alert_type: "Fatigue & Drowsiness Warning",
      severity: "High",
      machine_id: "CAT-EX-320",
      operator_id: "OP-401",
      message: `Drowsiness detected by camera AI — Eye Aspect Ratio dropped to ${earValue?.toFixed(3) ?? "N/A"}. Immediate rest required.`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    setAlerts((prev) => [syntheticAlert, ...prev]);
  }, []);

  const handleSimulateTelemetry = async () => {
    const isIncident = Math.random() > 0.45;
    const currentStreak = telemetry.length > 0 ? (telemetry[telemetry.length - 1].continuous_run_hours ?? 1.2) : 1.2;
    const nextStreak = Number((currentStreak + (isIncident ? 1.5 : 0.4)).toFixed(1));

    const mockTelemetry = {
      machine_id: "CAT-EX-320",
      operator_id: "OP-401",
      engine_hours: Number((1250 + Math.random() * 10).toFixed(1)),
      fuel_used_liters: Number((15 + Math.random() * 20).toFixed(1)),
      load_cycles: isIncident ? 1 : Math.floor(4 + Math.random() * 20),
      idling_time_min: isIncident ? 48 : Math.floor(Math.random() * 20),
      continuous_run_hours: nextStreak,
      seatbelt_status: isIncident && Math.random() > 0.5 ? "Unfastened" : "Fastened",
      proximity_distance_m: isIncident && Math.random() > 0.5 ? 1.8 : Number((4 + Math.random() * 6).toFixed(1)),
    };

    if (!isOnline) {
      const queued = [...offlineQueue, mockTelemetry];
      updateOfflineQueue(queued);
      setTelemetry((prev) => [...prev, { ...mockTelemetry, timestamp: new Date().toISOString() }]);
      return;
    }

    try {
      const saved = await sendTelemetry(mockTelemetry);
      setTelemetry((prev) => [...prev, saved]);
      const [refreshedAlerts, refreshedHealth, chain] = await Promise.all([
        fetchAlerts().catch(() => []),
        fetchMachineHealthScore().catch(() => null),
        fetchLedger().catch(() => ledgerChain),
      ]);
      setAlerts(refreshedAlerts);
      if (refreshedHealth) setMachineHealth(refreshedHealth);
      setLedgerChain(chain);
    } catch {
      const queued = [...offlineQueue, mockTelemetry];
      updateOfflineQueue(queued);
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
        isOnline={isOnline}
        offlineQueueCount={offlineQueue.length}
        onSyncOffline={handleSyncOffline}
      />

      <main style={{ padding: "2rem", maxWidth: "1320px", margin: "0 auto", width: "100%", flex: 1 }}>
        <AlertBanner alerts={activeAlerts} onAcknowledge={handleAcknowledge} />

        {currentView === "dashboard" && (
          <DashboardPage
            tasks={tasks}
            onAddTask={handleAddTask}
            telemetry={telemetry}
            alerts={alerts}
            machineHealth={machineHealth}
          />
        )}
        {currentView === "safety" && (
          <SafetyPage
            telemetry={telemetry}
            alerts={alerts}
            onAcknowledge={handleAcknowledge}
            onTakeBreak={handleTakeBreak}
          />
        )}
        {currentView === "drowsiness" && (
          <DrowsinessPage onDrowsinessAlert={handleDrowsinessAlert} />
        )}
        {currentView === "analytics" && (
          <AnalyticsPage
            telemetry={telemetry}
            machineHealth={machineHealth}
            onSimulateTelemetry={handleSimulateTelemetry}
          />
        )}
        {currentView === "ledger" && (
          <LedgerPage
            chain={ledgerChain}
            setChain={setLedgerChain}
          />
        )}
        {currentView === "training" && <TrainingPage modules={modules} />}
      </main>
    </div>
  );
}

export default App;
