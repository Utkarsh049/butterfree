import React from "react";

export function TrainingHub({ modules = [] }) {
  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>Operator Training Hub</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}>
        {modules.map((m) => (
          <div
            key={m.id}
            style={{
              backgroundColor: "#FFF",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{
                  backgroundColor: "var(--cat-light-gray)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}>
                  {m.category}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#666" }}>{m.duration_min} mins</span>
              </div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{m.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#666" }}>Level: <strong>{m.difficulty}</strong></p>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <button
                style={{
                  flex: 1,
                  backgroundColor: "var(--cat-yellow)",
                  color: "var(--cat-black)",
                  border: "none",
                  padding: "0.6rem 1rem",
                }}
              >
                Start Module
              </button>
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #CCC",
                  padding: "0.6rem 1rem",
                }}
              >
                Book Instructor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

