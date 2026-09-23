"""Digital Twin / Machine Health Score service."""

from datetime import datetime
from typing import List, Optional
from ..models.health import MachineHealthScore, HealthRating
from ..models.telemetry import Telemetry


def calculate_machine_health(machine_id: str, telemetry_history: List[Telemetry]) -> MachineHealthScore:
    """
    Calculate dynamic Machine Health Score (0–100) aggregating:
    - Idling Ratio (30% weight)
    - Fuel Burn Efficiency (25% weight)
    - Service Interval Proximity (25% weight)
    - Load Cycle Mechanical Stress (20% weight)
    """
    # Filter telemetry for machine
    machine_logs = [t for t in telemetry_history if t.machine_id == machine_id]
    latest = machine_logs[-1] if machine_logs else None

    if not latest:
        # Default baseline for machine with no telemetry yet
        return MachineHealthScore(
            machine_id=machine_id,
            score=95,
            rating=HealthRating.OPTIMAL,
            idle_ratio_pct=15.0,
            fuel_burn_rate_lph=14.5,
            service_hours_remaining=120.0,
            subscores={"engine": 95, "fuel": 95, "hydraulics": 95, "service": 95},
            recommended_action="Machine is operating at peak factory specifications.",
            evaluated_at=datetime.utcnow(),
        )

    # 1. Idle Ratio Subscore (0-100)
    # Target: under 20% is ideal (100 pts), 20-40% (70-90 pts), >40% drops rapidly
    total_minutes = max(latest.engine_hours * 60, 60.0)
    idle_pct = min(round((latest.idling_time_min / 60.0) / max(latest.engine_hours, 1.0) * 100, 1), 60.0)
    if idle_pct <= 20.0:
        idle_subscore = 100
    elif idle_pct <= 35.0:
        idle_subscore = 80
    elif idle_pct <= 50.0:
        idle_subscore = 60
    else:
        idle_subscore = 40

    # 2. Fuel Efficiency Subscore (0-100)
    # Typical baseline: ~15 L/hr. If > 25 L/hr, inefficient
    burn_rate_lph = round(latest.fuel_used_liters / max(latest.engine_hours, 1.0), 1)
    if burn_rate_lph <= 16.0:
        fuel_subscore = 100
    elif burn_rate_lph <= 22.0:
        fuel_subscore = 80
    elif burn_rate_lph <= 30.0:
        fuel_subscore = 60
    else:
        fuel_subscore = 45

    # 3. Service Schedule Subscore (0-100)
    # Standard CAT 250-hour preventative maintenance window
    service_cycle = 250.0
    hours_remaining = round(service_cycle - (latest.engine_hours % service_cycle), 1)
    if hours_remaining > 50.0:
        service_subscore = 100
    elif hours_remaining > 20.0:
        service_subscore = 75
    elif hours_remaining > 5.0:
        service_subscore = 55
    else:
        service_subscore = 35

    # 4. Hydraulics / Mechanical Stress Subscore (0-100)
    # Normal load cycles: healthy operation. 0 cycles with high engine hours = sub-optimal
    if latest.load_cycles >= 5:
        stress_subscore = 95
    elif latest.load_cycles >= 2:
        stress_subscore = 75
    else:
        stress_subscore = 50

    # Composite Weighted Health Score
    composite_score = int(
        (idle_subscore * 0.30)
        + (fuel_subscore * 0.25)
        + (service_subscore * 0.25)
        + (stress_subscore * 0.20)
    )
    composite_score = max(0, min(100, composite_score))

    # Rating and Recommended Action
    if composite_score >= 85:
        rating = HealthRating.OPTIMAL
        rec = "All systems green. Normal preventative inspection scheduled."
    elif composite_score >= 65:
        rating = HealthRating.ATTENTION_REQUIRED
        if hours_remaining <= 25.0:
            rec = f"Upcoming {int(service_cycle)}h service due in {hours_remaining} hrs. Schedule maintenance crew."
        elif idle_pct > 30.0:
            rec = "High idling ratio detected. Coach operator on auto-idle shutdown to reduce carbon build-up."
        else:
            rec = "Elevated fuel consumption rate. Inspect air filters and hydraulic fluid levels."
    else:
        rating = HealthRating.MAINTENANCE_REQUIRED
        rec = "Critical maintenance alert: Inspect hydraulics and schedule urgent diagnostic check."

    return MachineHealthScore(
        machine_id=machine_id,
        score=composite_score,
        rating=rating,
        idle_ratio_pct=idle_pct,
        fuel_burn_rate_lph=burn_rate_lph,
        service_hours_remaining=hours_remaining,
        subscores={
            "idle_efficiency": idle_subscore,
            "fuel_system": fuel_subscore,
            "service_schedule": service_subscore,
            "hydraulics": stress_subscore,
        },
        recommended_action=rec,
        evaluated_at=datetime.utcnow(),
    )

