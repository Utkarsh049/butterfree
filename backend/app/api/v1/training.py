"""Training Hub endpoints."""

from typing import List
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/training", tags=["training"])


class TrainingModule(BaseModel):
    id: str
    title: str
    category: str
    duration_min: int
    difficulty: str
    completed: bool = False


SAMPLE_MODULES: List[TrainingModule] = [
    TrainingModule(id="TRN-01", title="Excavator Trenching & Safety Protocol", category="Safety", duration_min=25, difficulty="Beginner"),
    TrainingModule(id="TRN-02", title="Fuel-Efficient Operating Techniques", category="Efficiency", duration_min=20, difficulty="Intermediate"),
    TrainingModule(id="TRN-03", title="Proximity Detection & Blind-Spot Hazards", category="Safety", duration_min=15, difficulty="All Levels"),
    TrainingModule(id="TRN-04", title="CAT Grade Assist Simulation & Controls", category="Advanced Operations", duration_min=45, difficulty="Expert"),
]


@router.get("/modules", response_model=List[TrainingModule])
def get_training_modules():
    """Retrieve available training courses and simulation modules."""
    return SAMPLE_MODULES

