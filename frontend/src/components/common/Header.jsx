import React from "react";

export function Header({
  currentView,
  setCurrentView,
  activeAlertsCount = 0,
  isOnline = true,
  offlineQueueCount = 0,
  onSyncOffline,
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "safety", label: "Safety & Hazards" },
    { id: "training", label: "Training Hub" },
    { id: "analytics", label: "Machine Health & Telemetry" },
  ];

  return (
    <header style={{
      backgroundColor: "var(--cat-black)",
      color: "#FFF",
      padding: "0.85rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "4px solid var(--cat-yellow)",
      flexWrap: "wrap",
      gap: "1rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{
          backgroundColor: "var(--cat-yellow)",
          color: "var(--cat-black)",
          fontWeight: 900,
          padding: "0.4rem 0.8rem",
          borderRadius: "4px",
          letterSpacing: "1px",
        }}>
          CAT
        </div>
        <div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Smart Operator Assistant</h1>
          <div style={{ fontSize: "0.75rem", color: "#BBB" }}>Excavator 320 Intelligence Hub</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        {/* Connectivity & Offline Sync Status Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: isOnline ? "#4CAF50" : "#FF9800",
            boxShadow: isOnline ? "0 0 8px #4CAF50" : "0 0 8px #FF9800",
          }} />
          <span style={{ fontSize: "0.8rem", color: isOnline ? "#A5D6A7" : "#FFE082", fontWeight: 600 }}>
            {isOnline ? "Online" : "Offline (Local Cache)"}
          </span>
          {offlineQueueCount > 0 && (
            <button
              onClick={onSyncOffline}
              style={{
                backgroundColor: "var(--cat-warning)",
                color: "#FFF",
                border: "none",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
              title="Click to flush offline queue"
            >
              Sync {offlineQueueCount} queued
            </button>
          )}
        </div>

        <nav style={{ display: "flex", gap: "0.4rem" }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                padding: "0.45rem 0.9rem",
                border: "none",
                backgroundColor: currentView === item.id ? "var(--cat-yellow)" : "transparent",
                color: currentView === item.id ? "var(--cat-black)" : "#FFF",
                borderRadius: "4px",
                fontWeight: currentView === item.id ? 700 : 500,
              }}
            >
              {item.label}
              {item.id === "safety" && activeAlertsCount > 0 && (
                <span style={{
                  marginLeft: "6px",
                  backgroundColor: "var(--cat-danger)",
                  color: "#FFF",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                }}>
                  {activeAlertsCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
