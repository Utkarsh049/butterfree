"""Inference and Explainable AI (XAI) helper for Task Time Estimation."""

from pathlib import Path
from typing import Dict, Any
import joblib
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent.parent / "saved_models" / "task_time_model.joblib"

BASE_TASK_TIMES = {
    "Excavation": 180,
    "Trenching": 120,
    "Loading": 90,
    "Grading": 150,
    "Demolition": 240,
}

WEATHER_MULTIPLIER = {
    "Sunny": 1.0,
    "Cloudy": 1.05,
    "Windy": 1.15,
    "Rainy": 1.30,
}

SKILL_MULTIPLIER = {
    "Expert": 0.85,
    "Intermediate": 1.0,
    "Beginner": 1.25,
}


def predict_task_time(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> float:
    """Predict task completion duration in minutes."""
    res = predict_task_time_explainable(task_type, weather, operator_skill, machine_age_years)
    return res["predicted_time_min"]


def predict_task_time_explainable(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> Dict[str, Any]:
    """
    Predict task completion time and provide an Explainable AI (XAI) feature attribution breakdown:
    Predicted Duration = Base Time + Δ(Weather) + Δ(Operator Skill) + Δ(Machine Age)
    """
    base_time = BASE_TASK_TIMES.get(task_type, 120)
    w_mult = WEATHER_MULTIPLIER.get(weather, 1.0)
    s_mult = SKILL_MULTIPLIER.get(operator_skill, 1.0)
    age_mult = 1.0 + (machine_age_years * 0.02)

    # Compute individual delta impact minutes compared to ideal baseline
    weather_delta = round(base_time * (w_mult - 1.0), 1)
    skill_delta = round(base_time * (s_mult - 1.0), 1)
    age_delta = round(base_time * (age_mult - 1.0), 1)

    predicted_total = round(base_time + weather_delta + skill_delta + age_delta, 1)

    # If trained pipeline artifact is present, we refine predicted_total with model prediction
    if MODEL_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
            df_input = pd.DataFrame([{
                "task_type": task_type,
                "weather": weather,
                "operator_skill": operator_skill,
                "machine_age_years": machine_age_years,
            }])
            ml_pred = float(model.predict(df_input)[0])
            predicted_total = round(ml_pred, 1)
        except Exception:
            pass

    # Build human-readable explanation
    weather_sign = "+" if weather_delta >= 0 else ""
    skill_sign = "+" if skill_delta >= 0 else ""
    age_sign = "+" if age_delta >= 0 else ""

    explanation = (
        f"Estimated {predicted_total} min — Base {base_time} min "
        f"({weather_sign}{weather_delta}m due to {weather} weather, "
        f"{skill_sign}{skill_delta}m due to {operator_skill} skill, "
        f"{age_sign}{age_delta}m for machine age {machine_age_years} yrs)"
    )

    return {
        "predicted_time_min": predicted_total,
        "base_time_min": base_time,
        "weather_delta_min": weather_delta,
        "skill_delta_min": skill_delta,
        "age_delta_min": age_delta,
        "explanation": explanation,
        "feature_impacts": {
            "base": float(base_time),
            "weather": float(weather_delta),
            "skill": float(skill_delta),
            "machine_age": float(age_delta),
        },
    }
