"""Unit tests for Digital Twin Machine Health Score service."""

from datetime import datetime
from app.models.telemetry import Telemetry, SeatbeltStatus
from app.models.health import HealthRating
from app.services.health_service import calculate_machine_health


def test_optimal_machine_health():
    telemetry = [
        Telemetry(
            timestamp=datetime.utcnow(),
            machine_id="CAT-EX-OPT",
            operator_id="OP-01",
            engine_hours=100.0,
            fuel_used_liters=1400.0,  # ~14 L/hr
            load_cycles=12,
            idling_time_min=10,
            continuous_run_hours=1.5,
            seatbelt_status=SeatbeltStatus.FASTENED,
            proximity_distance_m=10.0,
            safety_alert_triggered=False,
        )
    ]
    health = calculate_machine_health("CAT-EX-OPT", telemetry)
    assert health.score >= 85
    assert health.rating == HealthRating.OPTIMAL


def test_degraded_machine_health_with_excessive_idling_and_service_due():
    telemetry = [
        Telemetry(
            timestamp=datetime.utcnow(),
            machine_id="CAT-EX-DEG",
            operator_id="OP-02",
            engine_hours=248.0,       # 2 hours before 250h service milestone
            fuel_used_liters=7500.0,   # ~30 L/hr high fuel burn
            load_cycles=1,
            idling_time_min=3000,      # excessive idling
            continuous_run_hours=3.0,
            seatbelt_status=SeatbeltStatus.FASTENED,
            proximity_distance_m=10.0,
            safety_alert_triggered=False,
        )
    ]
    health = calculate_machine_health("CAT-EX-DEG", telemetry)
    assert health.score < 85
    assert health.rating in (HealthRating.ATTENTION_REQUIRED, HealthRating.MAINTENANCE_REQUIRED)
    assert health.service_hours_remaining == 2.0

