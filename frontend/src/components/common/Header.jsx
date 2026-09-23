import React, { useState } from "react";

const BUTTERFLY_ICON = "🦋";

export function Header({
  currentView,
  setCurrentView,
  activeAlertsCount = 0,
  isOnline = true,
  offlineQueueCount = 0,
  onSyncOffline,
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📋" },
    { id: "safety", label: "Safety & Hazards", icon: "🛡️" },
    { id: "drowsiness", label: "Drowsiness AI", icon: "👁️" },
    { id: "analytics", label: "Machine Health", icon: "⚙️" },
    { id: "ledger", label: "Safety Ledger", icon: "🔗" },
    { id: "training", label: "Training Hub", icon: "🎓" },
  ];

  return (
    <header style={{
      background: "linear-gradient(135deg, #1C1C2E 0%, #1A5F7A 100%)",
      color: "#FFF",
      padding: "0 2rem",
      borderBottom: "3px solid #D4870A",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 4px 20px rgba(28,28,46,0.35)",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 0 0.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            className="animate-flutter"
            style={{ fontSize: "1.9rem", lineHeight: 1 }}
          >
            {BUTTERFLY_ICON}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-0.01em" }}>
              Butterfree
              <span style={{
                marginLeft: "0.5rem",
                fontSize: "0.65rem",
                fontWeight: 600,
                background: "#D4870A",
                color: "#1C1C2E",
                padding: "1px 6px",
                borderRadius: "4px",
                verticalAlign: "middle",
                letterSpacing: "0.04em",
              }}>CAT AI</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginTop: "1px" }}>
              Smart Operator Intelligence Hub · CAT 320 EX
            </div>
          </div>
        </div>

        {/* Right — online status */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Connectivity */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isOnline ? "#28A065" : "#D4870A",
              boxShadow: isOnline ? "0 0 8px #28A065" : "0 0 8px #D4870A",
            }} />
            <span style={{ fontSize: "0.75rem", color: isOnline ? "#A5D6A7" : "#FFE082", fontWeight: 600 }}>
              {isOnline ? "Online" : "Offline (Queued)"}
            </span>
            {offlineQueueCount > 0 && (
              <button
                onClick={onSyncOffline}
                style={{
                  background: "#D4870A",
                  color: "#FFF",
                  border: "none",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                Sync {offlineQueueCount}
              </button>
            )}
          </div>

          {/* Alerts badge */}
          {activeAlertsCount > 0 && (
            <div style={{
              background: "#A8273A",
              color: "#FFF",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "0.75rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              animation: "antennae-pulse 2s ease-in-out infinite",
            }}>
              ⚠️ {activeAlertsCount} Active Alert{activeAlertsCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Nav tabs */}
      <nav style={{ display: "flex", gap: "0.25rem", padding: "0.4rem 0" }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                padding: "0.4rem 0.8rem",
                border: "none",
                background: isActive
                  ? "linear-gradient(135deg, #D4870A, #F5A623)"
                  : "transparent",
                color: isActive ? "#1C1C2E" : "rgba(255,255,255,0.7)",
                borderRadius: "6px",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === "safety" && activeAlertsCount > 0 && (
                <span style={{
                  background: "#A8273A",
                  color: "#FFF",
                  padding: "1px 5px",
                  borderRadius: "8px",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                }}>
                  {activeAlertsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
