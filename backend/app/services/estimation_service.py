"""Task duration estimation service with Explainable AI (XAI) output."""

import sys
from pathlib import Path
from typing import Dict, Any

# Add ml-model to sys.path to enable direct inference import
ML_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ml-model" / "src"
if str(ML_DIR) not in sys.path:
    sys.path.append(str(ML_DIR))

try:
    from predict import predict_task_time, predict_task_time_explainable  # type: ignore
except ImportError:
    def predict_task_time(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> float:
        base_times = {"Excavation": 180, "Trenching": 120, "Loading": 90, "Grading": 150, "Demolition": 240}
        return float(base_times.get(task_type, 120))

    def predict_task_time_explainable(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> Dict[str, Any]:
        base = 120
        return {
            "predicted_time_min": float(base),
            "base_time_min": base,
            "weather_delta_min": 0.0,
            "skill_delta_min": 0.0,
            "age_delta_min": 0.0,
            "explanation": f"Estimated {base} min baseline duration.",
            "feature_impacts": {"base": float(base), "weather": 0.0, "skill": 0.0, "machine_age": 0.0},
        }


def estimate_task_duration(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> float:
    """Estimate expected duration in minutes."""
    return predict_task_time(task_type, weather, operator_skill, machine_age_years)


def estimate_task_duration_explainable(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> Dict[str, Any]:
    """Estimate expected duration with explainability breakdown."""
    return predict_task_time_explainable(task_type, weather, operator_skill, machine_age_years)
