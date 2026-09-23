"""Safety Engine: rule-based and inference-based checks for seatbelt, proximity, and operator fatigue."""

import uuid
from datetime import datetime
from typing import List
from ..core.config import settings
from ..models.alert import Alert, AlertSeverity, AlertType
from ..models.telemetry import Telemetry, SeatbeltStatus


def evaluate_telemetry_safety(telemetry: Telemetry) -> List[Alert]:
    """Evaluate telemetry record against physical and inference-based safety rules."""
    alerts: List[Alert] = []

    # Rule 1: Seatbelt compliance check
    if telemetry.seatbelt_status == SeatbeltStatus.UNFASTENED:
        alerts.append(
            Alert(
                id=f"ALT-SB-{uuid.uuid4().hex[:6]}",
                alert_type=AlertType.SEATBELT_UNFASTENED,
                severity=AlertSeverity.HIGH,
                machine_id=telemetry.machine_id,
                operator_id=telemetry.operator_id,
                message=f"Operator {telemetry.operator_id} seatbelt is unfastened during machine operation.",
                timestamp=datetime.utcnow(),
                acknowledged=False,
            )
        )

    # Rule 2: Proximity hazard alert (< 3.0 meters threshold)
    if telemetry.proximity_distance_m < settings.PROXIMITY_HAZARD_THRESHOLD_METERS:
        alerts.append(
            Alert(
                id=f"ALT-PRX-{uuid.uuid4().hex[:6]}",
                alert_type=AlertType.PROXIMITY_HAZARD,
                severity=AlertSeverity.CRITICAL,
                machine_id=telemetry.machine_id,
                operator_id=telemetry.operator_id,
                message=(
                    f"Proximity hazard: Obstacle detected within "
                    f"{telemetry.proximity_distance_m:.1f}m (Threshold: {settings.PROXIMITY_HAZARD_THRESHOLD_METERS}m)."
                ),
                timestamp=datetime.utcnow(),
                acknowledged=False,
            )
        )

    # Rule 3: Operator Fatigue & Drowsiness Inference
    fatigue_alerts = evaluate_operator_fatigue(telemetry)
    alerts.extend(fatigue_alerts)

    return alerts


def evaluate_operator_fatigue(telemetry: Telemetry) -> List[Alert]:
    """Infer operator fatigue from continuous operational streaks, late-shift cycle drops, and micro-idling."""
    alerts: List[Alert] = []

    # Severe streak (> 4.5 hours without break)
    if telemetry.continuous_run_hours >= 4.5:
        alerts.append(
            Alert(
                id=f"ALT-FTG-{uuid.uuid4().hex[:6]}",
                alert_type=AlertType.FATIGUE_WARNING,
                severity=AlertSeverity.HIGH,
                machine_id=telemetry.machine_id,
                operator_id=telemetry.operator_id,
                message=(
                    f"Critical Fatigue Alert: Operator {telemetry.operator_id} has operated continuously for "
                    f"{telemetry.continuous_run_hours:.1f} hours without an active break."
                ),
                timestamp=datetime.utcnow(),
                acknowledged=False,
            )
        )
    # Proactive break nudge (> 3.0 hours continuous)
    elif telemetry.continuous_run_hours >= 3.0:
        alerts.append(
            Alert(
                id=f"ALT-BRK-{uuid.uuid4().hex[:6]}",
                alert_type=AlertType.BREAK_NUDGE,
                severity=AlertSeverity.MEDIUM,
                machine_id=telemetry.machine_id,
                operator_id=telemetry.operator_id,
                message=(
                    f"Operator Rest Nudge: {telemetry.continuous_run_hours:.1f} hrs of continuous operation detected. "
                    f"Recommended: Take a 15-minute hydration and stretch break."
                ),
                timestamp=datetime.utcnow(),
                acknowledged=False,
            )
        )

    # Drowsiness / Reflex degradation pattern: continuous hours >= 2.5 + high micro-idling + few cycles
    if telemetry.continuous_run_hours >= 2.5 and telemetry.idling_time_min > 25 and telemetry.load_cycles < 4:
        alerts.append(
            Alert(
                id=f"ALT-DRW-{uuid.uuid4().hex[:6]}",
                alert_type=AlertType.FATIGUE_WARNING,
                severity=AlertSeverity.MEDIUM,
                machine_id=telemetry.machine_id,
                operator_id=telemetry.operator_id,
                message=(
                    f"Drowsiness Pattern Detected: Extended idling pauses ({telemetry.idling_time_min}m) and "
                    f"sluggish load cycles during late operating streak."
                ),
                timestamp=datetime.utcnow(),
                acknowledged=False,
            )
        )

    return alerts
