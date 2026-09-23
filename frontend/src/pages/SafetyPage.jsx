import React from "react";
import { SafetyPanel } from "../components/safety/SafetyPanel";

export function SafetyPage({ telemetry, alerts, onAcknowledge, onTakeBreak }) {
  return (
    <SafetyPanel
      telemetry={telemetry}
      alerts={alerts}
      onAcknowledge={onAcknowledge}
      onTakeBreak={onTakeBreak}
    />
  );
}


