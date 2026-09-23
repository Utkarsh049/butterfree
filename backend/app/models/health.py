"""Digital Twin / Machine Health Score data models."""

from datetime import datetime
from enum import Enum
from typing import List, Dict
from pydantic import BaseModel, Field


class HealthRating(str, Enum):
    OPTIMAL = "Optimal"
    ATTENTION_REQUIRED = "Attention Required"
    MAINTENANCE_REQUIRED = "Maintenance Required"


class MachineHealthScore(BaseModel):
    machine_id: str
    score: int = Field(ge=0, le=100)
    rating: HealthRating
    idle_ratio_pct: float
    fuel_burn_rate_lph: float
    service_hours_remaining: float
    subscores: Dict[str, int]
    recommended_action: str
    evaluated_at: datetime

