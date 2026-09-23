"""Telemetry ingestion and monitoring endpoints with offline sync support."""

from datetime import datetime
from typing import List
from fastapi import APIRouter
from ...models.telemetry import (
    Telemetry,
    TelemetryCreate,
    TelemetryBatchSyncRequest,
    TelemetryBatchSyncResponse,
)
from ...db.session import TELEMETRY_DB, ALERTS_DB
from ...services.safety_engine import evaluate_telemetry_safety
from ...services.anomaly_detector import detect_telemetry_anomalies
from ...services.safety_ledger import SAFETY_LEDGER

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.get("", response_model=List[Telemetry])
def get_telemetry():
    """Get recorded machine telemetry logs."""
    return TELEMETRY_DB[-50:]


@router.post("", response_model=Telemetry)
def ingest_telemetry(payload: TelemetryCreate):
    """Ingest real-time machine telemetry and evaluate safety, fatigue, & anomaly rules."""
    timestamp = payload.timestamp or datetime.utcnow()
    telemetry = Telemetry(
        timestamp=timestamp,
        **payload.model_dump(exclude={"timestamp"}),
    )

    # Evaluate safety engine (including fatigue / drowsiness inference)
    safety_alerts = evaluate_telemetry_safety(telemetry)
    # Evaluate anomaly detection engine
    anomaly_alerts = detect_telemetry_anomalies(telemetry)

    all_alerts = safety_alerts + anomaly_alerts
    if all_alerts:
        telemetry.safety_alert_triggered = True
        ALERTS_DB.extend(all_alerts)
        # Append each alert as an immutable blockchain block
        for alert in all_alerts:
            SAFETY_LEDGER.add_incident(
                alert_id=alert.id,
                alert_type=alert.alert_type.value if hasattr(alert.alert_type, "value") else str(alert.alert_type),
                severity=alert.severity.value if hasattr(alert.severity, "value") else str(alert.severity),
                machine_id=alert.machine_id,
                operator_id=alert.operator_id,
                incident_summary=alert.message,
                timestamp=alert.timestamp.isoformat() + "Z" if hasattr(alert.timestamp, "isoformat") else str(alert.timestamp),
            )

    TELEMETRY_DB.append(telemetry)
    return telemetry


@router.post("/sync", response_model=TelemetryBatchSyncResponse)
def sync_offline_telemetry(batch: TelemetryBatchSyncRequest):
    """
    Offline-First Sync Endpoint: Ingest a batch of telemetry records buffered
    locally by the frontend while offline.
    """
    synced_count = 0
    total_alerts_triggered = 0

    for item in batch.records:
        timestamp = item.timestamp or datetime.utcnow()
        telemetry = Telemetry(
            timestamp=timestamp,
            **item.model_dump(exclude={"timestamp"}),
        )

        safety_alerts = evaluate_telemetry_safety(telemetry)
        anomaly_alerts = detect_telemetry_anomalies(telemetry)
        all_alerts = safety_alerts + anomaly_alerts

        if all_alerts:
            telemetry.safety_alert_triggered = True
            ALERTS_DB.extend(all_alerts)
            total_alerts_triggered += len(all_alerts)
            for alert in all_alerts:
                SAFETY_LEDGER.add_incident(
                    alert_id=alert.id,
                    alert_type=alert.alert_type.value if hasattr(alert.alert_type, "value") else str(alert.alert_type),
                    severity=alert.severity.value if hasattr(alert.severity, "value") else str(alert.severity),
                    machine_id=alert.machine_id,
                    operator_id=alert.operator_id,
                    incident_summary=alert.message,
                    timestamp=alert.timestamp.isoformat() + "Z" if hasattr(alert.timestamp, "isoformat") else str(alert.timestamp),
                )

        TELEMETRY_DB.append(telemetry)
        synced_count += 1

    return TelemetryBatchSyncResponse(
        status="success",
        synced_records_count=synced_count,
        alerts_triggered_count=total_alerts_triggered,
        message=f"Successfully synced {synced_count} offline records with {total_alerts_triggered} safety events logged.",
    )
