"""Anomaly Detection logic: rule-based and usage pattern checks."""

import uuid
from datetime import datetime
from typing import List
from ..core.config import settings
from ..models.alert import Alert, AlertSeverity, AlertType
from ..models.telemetry import Telemetry


def detect_telemetry_anomalies(telemetry: Telemetry) -> List[Alert]:
    """Inspect telemetry record for efficiency and operational anomalies."""
    alerts: List[Alert] = []

    # Rule 1: Excessive Idling (Threshold e.g. > 45 minutes)
    if telemetry.idling_time_min > settings.IDLE_TIME_THRESHOLD_MIN:
        alerts.append(
            Alert(
                id=f"ALT-IDL-{uuid.uuid4().hex[:6]}",
                alert_type=AlertType.EXCESSIVE_IDLING,
                severity=AlertSeverity.MEDIUM,
                machine_id=telemetry.machine_id,
                operator_id=telemetry.operator_id,
                message=(
                    f"Excessive idling detected: Machine has been idling for {telemetry.idling_time_min} mins "
                    f"(Threshold: {settings.IDLE_TIME_THRESHOLD_MIN} mins)."
                ),
                timestamp=datetime.utcnow(),
                acknowledged=False,
            )
        )

    # Rule 2: Unusual usage pattern: High engine hours with unusually low load cycles
    if telemetry.engine_hours > 5.0 and telemetry.load_cycles < 3:
        alerts.append(
            Alert(
                id=f"ALT-USG-{uuid.uuid4().hex[:6]}",
                alert_type=AlertType.UNUSUAL_USAGE_PATTERN,
                severity=AlertSeverity.LOW,
                machine_id=telemetry.machine_id,
                operator_id=telemetry.operator_id,
                message=(
                    f"Unusual usage pattern detected: High engine runtime ({telemetry.engine_hours:.1f} hrs) "
                    f"with only {telemetry.load_cycles} load cycles."
                ),
                timestamp=datetime.utcnow(),
                acknowledged=False,
            )
        )

    return alerts

