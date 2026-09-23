"""Safety Engine: rule-based checks for seatbelt compliance, proximity hazards, and incidents."""

import uuid
from datetime import datetime
from typing import List
from ..core.config import settings
from ..models.alert import Alert, AlertSeverity, AlertType
from ..models.telemetry import Telemetry, SeatbeltStatus


def evaluate_telemetry_safety(telemetry: Telemetry) -> List[Alert]:
    """Evaluate telemetry record against safety rules and generate alerts."""
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

    return alerts

