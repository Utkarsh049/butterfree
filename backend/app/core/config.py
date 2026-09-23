"""Application configuration settings."""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Smart Operator Assistant API"
    IDLE_TIME_THRESHOLD_MIN: int = int(os.getenv("IDLE_TIME_THRESHOLD_MIN", "45"))
    PROXIMITY_HAZARD_THRESHOLD_METERS: float = float(os.getenv("PROXIMITY_HAZARD_THRESHOLD_METERS", "3.0"))

    class Config:
        case_sensitive = True


settings = Settings()

