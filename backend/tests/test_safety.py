"""Unit tests for safety engine logic."""

from datetime import datetime
from app.models.telemetry import Telemetry, SeatbeltStatus
from app.models.alert import AlertType
from app.services.safety_engine import evaluate_telemetry_safety


def test_seatbelt_unfastened_triggers_alert():
    telemetry = Telemetry(
        timestamp=datetime.utcnow(),
        machine_id="CAT-TEST-1",
        operator_id="OP-10",
        engine_hours=10.0,
        fuel_used_liters=5.0,
        load_cycles=5,
        idling_time_min=5,
        seatbelt_status=SeatbeltStatus.UNFASTENED,
        proximity_distance_m=10.0,
        safety_alert_triggered=False,
    )
    alerts = evaluate_telemetry_safety(telemetry)
    assert any(a.alert_type == AlertType.SEATBELT_UNFASTENED for a in alerts)


def test_proximity_hazard_triggers_critical_alert():
    telemetry = Telemetry(
        timestamp=datetime.utcnow(),
        machine_id="CAT-TEST-1",
        operator_id="OP-10",
        engine_hours=10.0,
        fuel_used_liters=5.0,
        load_cycles=5,
        idling_time_min=5,
        seatbelt_status=SeatbeltStatus.FASTENED,
        proximity_distance_m=1.8,  # Below 3.0m threshold
        safety_alert_triggered=False,
    )
    alerts = evaluate_telemetry_safety(telemetry)
    assert any(a.alert_type == AlertType.PROXIMITY_HAZARD for a in alerts)

