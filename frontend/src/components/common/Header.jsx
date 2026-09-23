import React from "react";

export function Header({ currentView, setCurrentView, activeAlertsCount = 0 }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "safety", label: "Safety & Hazards" },
    { id: "training", label: "Training Hub" },
    { id: "analytics", label: "Machine Telemetry" },
  ];

  return (
    <header style={{
      backgroundColor: "var(--cat-black)",
      color: "#FFF",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "4px solid var(--cat-yellow)",
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
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Smart Operator Assistant</h1>
      </div>

      <nav style={{ display: "flex", gap: "0.5rem" }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              backgroundColor: currentView === item.id ? "var(--cat-yellow)" : "transparent",
              color: currentView === item.id ? "var(--cat-black)" : "#FFF",
              borderRadius: "4px",
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
    </header>
  );
}

