import React from "react";
import { AnomalyFeed } from "../components/anomaly/AnomalyFeed";

export function AnalyticsPage({ telemetry, onSimulateTelemetry }) {
  return <AnomalyFeed telemetry={telemetry} onSimulateTelemetry={onSimulateTelemetry} />;
}

