"""Task duration estimation service."""

import sys
from pathlib import Path

# Add ml-model to sys.path to enable direct inference import
ML_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ml-model" / "src"
if str(ML_DIR) not in sys.path:
    sys.path.append(str(ML_DIR))

try:
    from predict import predict_task_time  # type: ignore
except ImportError:
    def predict_task_time(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> float:
        # Fallback baseline calculation
        base_times = {"Excavation": 180, "Trenching": 120, "Loading": 90, "Grading": 150, "Demolition": 240}
        base = base_times.get(task_type, 120)
        return float(base)


def estimate_task_duration(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> float:
    """Estimate expected duration in minutes using ML model or fallback."""
    return predict_task_time(task_type, weather, operator_skill, machine_age_years)

