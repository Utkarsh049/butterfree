"""Task management and estimation endpoints."""

import uuid
from typing import List
from fastapi import APIRouter, HTTPException
from ...models.task import Task, TaskCreate, TaskPredictionRequest, TaskPredictionResponse
from ...db.session import TASKS_DB
from ...services.estimation_service import estimate_task_duration_explainable

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[Task])
def get_tasks():
    """Retrieve all daily tasks."""
    return list(TASKS_DB.values())


@router.post("", response_model=Task)
def create_task(task_in: TaskCreate):
    """Schedule a new task with estimated time."""
    new_id = f"TSK-{uuid.uuid4().hex[:4].upper()}"
    task = Task(task_id=new_id, **task_in.model_dump())
    TASKS_DB[new_id] = task
    return task


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: str):
    """Retrieve a task by ID."""
    if task_id not in TASKS_DB:
        raise HTTPException(status_code=404, detail="Task not found")
    return TASKS_DB[task_id]


@router.post("/estimate", response_model=TaskPredictionResponse)
def estimate_task(req: TaskPredictionRequest):
    """Get ML-based task completion time estimation with Explainable AI (XAI) feature attribution."""
    prediction = estimate_task_duration_explainable(
        task_type=req.task_type.value,
        weather=req.weather.value,
        operator_skill=req.operator_skill.value,
        machine_age_years=req.machine_age_years,
    )
    return TaskPredictionResponse(
        task_type=req.task_type,
        predicted_time_min=prediction["predicted_time_min"],
        base_time_min=prediction["base_time_min"],
        weather_delta_min=prediction["weather_delta_min"],
        skill_delta_min=prediction["skill_delta_min"],
        age_delta_min=prediction["age_delta_min"],
        explanation=prediction["explanation"],
        feature_impacts=prediction["feature_impacts"],
    )
