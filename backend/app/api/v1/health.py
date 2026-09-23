"""Digital Twin & Machine Health Score endpoints."""

from typing import List
from fastapi import APIRouter
from ...models.health import MachineHealthScore
from ...db.session import TELEMETRY_DB
from ...services.health_service import calculate_machine_health

router = APIRouter(prefix="/health-score", tags=["health"])


@router.get("/{machine_id}", response_model=MachineHealthScore)
def get_machine_health(machine_id: str):
    """Retrieve dynamic Digital Twin Machine Health Score and predictive maintenance status."""
    return calculate_machine_health(machine_id, TELEMETRY_DB)


@router.get("", response_model=List[MachineHealthScore])
def get_all_machines_health():
    """Retrieve Machine Health Scores for all tracked machinery."""
    machine_ids = list({t.machine_id for t in TELEMETRY_DB})
    if not machine_ids:
        machine_ids = ["CAT-EX-320", "CAT-LD-950"]
    return [calculate_machine_health(m_id, TELEMETRY_DB) for m_id in machine_ids]

