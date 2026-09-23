"""Unit tests for anomaly detection logic."""

from datetime import datetime
from app.models.telemetry import Telemetry, SeatbeltStatus
from app.models.alert import AlertType
from app.services.anomaly_detector import detect_telemetry_anomalies


def test_excessive_idling_triggers_anomaly_alert():
    telemetry = Telemetry(
        timestamp=datetime.utcnow(),
        machine_id="CAT-TEST-1",
        operator_id="OP-10",
        engine_hours=10.0,
        fuel_used_liters=5.0,
        load_cycles=5,
        idling_time_min=55,  # Exceeds 45m threshold
        seatbelt_status=SeatbeltStatus.FASTENED,
        proximity_distance_m=10.0,
        safety_alert_triggered=False,
    )
    alerts = detect_telemetry_anomalies(telemetry)
    assert any(a.alert_type == AlertType.EXCESSIVE_IDLING for a in alerts)


def test_unusual_usage_pattern_triggers_alert():
    telemetry = Telemetry(
        timestamp=datetime.utcnow(),
        machine_id="CAT-TEST-1",
        operator_id="OP-10",
        engine_hours=8.0,  # > 5 hours
        fuel_used_liters=25.0,
        load_cycles=1,    # < 3 cycles
        idling_time_min=10,
        seatbelt_status=SeatbeltStatus.FASTENED,
        proximity_distance_m=10.0,
        safety_alert_triggered=False,
    )
    alerts = detect_telemetry_anomalies(telemetry)
    assert any(a.alert_type == AlertType.UNUSUAL_USAGE_PATTERN for a in alerts)

