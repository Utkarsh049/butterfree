"""Central API v1 router combining all resource routes."""

from fastapi import APIRouter
from .tasks import router as tasks_router
from .telemetry import router as telemetry_router
from .alerts import router as alerts_router
from .training import router as training_router

api_router = APIRouter()
api_router.include_router(tasks_router)
api_router.include_router(telemetry_router)
api_router.include_router(alerts_router)
api_router.include_router(training_router)

