"""Alert and incident models."""

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

