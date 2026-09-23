"""Task data models."""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TaskType(str, Enum):
    EXCAVATION = "Excavation"
    TRENCHING = "Trenching"
    LOADING = "Loading"
    GRADING = "Grading"
    DEMOLITION = "Demolition"


class WeatherCondition(str, Enum):
    SUNNY = "Sunny"
    RAINY = "RainY"
    CLOUDY = "Cloudy"
    WINDY = "Windy"


class OperatorSkill(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    EXPERT = "Expert"


class TaskBase(BaseModel):
    task_type: TaskType
    weather: WeatherCondition
    operator_skill: OperatorSkill
    machine_age_years: int = Field(ge=0, le=30)
    estimated_time_min: int = Field(gt=0)


class TaskCreate(TaskBase):
    pass


class Task(TaskBase):
    task_id: str
    actual_time_min: Optional[int] = None
    status: str = "Scheduled"  # Scheduled, In Progress, Completed


class TaskPredictionRequest(BaseModel):
    task_type: TaskType
    weather: WeatherCondition
    operator_skill: OperatorSkill
    machine_age_years: int

