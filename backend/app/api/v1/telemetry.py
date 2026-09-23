"""Telemetry ingestion and monitoring endpoints."""

from datetime import datetime
from typing import List
from fastapi import APIRouter
from ...models.telemetry import Telemetry, TelemetryCreate
from ...db.session import TELEMETRY_DB, ALERTS_DB
from ...services.safety_engine import evaluate_telemetry_safety
from ...services.anomaly_detector import detect_telemetry_anomalies

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.get("", response_model=List[Telemetry])
def get_telemetry():
    """Get recorded machine telemetry logs."""
    return TELEMETRY_DB[-50:]


@router.post("", response_model=Telemetry)
def ingest_telemetry(payload: TelemetryCreate):
    """Ingest real-time machine telemetry and evaluate safety & anomaly rules."""
    timestamp = payload.timestamp or datetime.utcnow()
    telemetry = Telemetry(
        timestamp=timestamp,
        **payload.model_dump(exclude={"timestamp"}),
    )

    # Evaluate safety engine
    safety_alerts = evaluate_telemetry_safety(telemetry)
    # Evaluate anomaly detection engine
    anomaly_alerts = detect_telemetry_anomalies(telemetry)

    all_alerts = safety_alerts + anomaly_alerts
    if all_alerts:
        telemetry.safety_alert_triggered = True
        ALERTS_DB.extend(all_alerts)

    TELEMETRY_DB.append(telemetry)
    return telemetry

