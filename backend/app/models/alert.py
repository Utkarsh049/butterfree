"""Alert and incident models with fatigue and health warnings."""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class AlertSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class AlertType(str, Enum):
    SEATBELT_UNFASTENED = "Seatbelt Unfastened"
    PROXIMITY_HAZARD = "Proximity Hazard"
    EXCESSIVE_IDLING = "Excessive Idling"
    UNUSUAL_USAGE_PATTERN = "Unusual Usage Pattern"
    FATIGUE_WARNING = "Fatigue & Drowsiness Warning"
    BREAK_NUDGE = "Operator Rest Break Nudge"
    MACHINE_HEALTH_WARNING = "Machine Health Degradation"


class AlertBase(BaseModel):
    alert_type: AlertType
    severity: AlertSeverity
    machine_id: str
    operator_id: str
    message: str


class AlertCreate(AlertBase):
    pass


class Alert(AlertBase):
    id: str
    timestamp: datetime
    acknowledged: bool = False
