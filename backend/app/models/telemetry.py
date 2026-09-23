"""Telemetry data models."""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SeatbeltStatus(str, Enum):
    FASTENED = "Fastened"
    UNFASTENED = "Unfastened"


class TelemetryBase(BaseModel):
    machine_id: str
    operator_id: str
    engine_hours: float = Field(ge=0.0)
    fuel_used_liters: float = Field(ge=0.0)
    load_cycles: int = Field(ge=0)
    idling_time_min: int = Field(ge=0)
    seatbelt_status: SeatbeltStatus
    proximity_distance_m: float = Field(ge=0.0)
    safety_alert_triggered: bool = False


class TelemetryCreate(TelemetryBase):
    timestamp: Optional[datetime] = None


class Telemetry(TelemetryBase):
    timestamp: datetime

