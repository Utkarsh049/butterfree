"""Alert management and incident logging endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException
from ...models.alert import Alert
from ...db.session import ALERTS_DB

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=List[Alert])
def get_alerts():
    """Retrieve all safety alerts and anomaly incidents."""
    return ALERTS_DB


@router.get("/active", response_model=List[Alert])
def get_active_alerts():
    """Retrieve all active (unacknowledged) safety alerts."""
    return [a for a in ALERTS_DB if not a.acknowledged]


@router.post("/{alert_id}/acknowledge", response_model=Alert)
def acknowledge_alert(alert_id: str):
    """Acknowledge a safety alert or incident."""
    for alert in ALERTS_DB:
        if alert.id == alert_id:
            alert.acknowledged = True
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

