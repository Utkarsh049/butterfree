import React from "react";
import { AnomalyFeed } from "../components/anomaly/AnomalyFeed";

export function AnalyticsPage({ telemetry, machineHealth, onSimulateTelemetry }) {
  return (
    <AnomalyFeed
      telemetry={telemetry}
      machineHealth={machineHealth}
      onSimulateTelemetry={onSimulateTelemetry}
    />
  );
}
