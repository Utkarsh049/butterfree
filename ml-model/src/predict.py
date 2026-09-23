"""Inference helper for Task Time Estimation model."""

from pathlib import Path
import joblib
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent.parent / "saved_models" / "task_time_model.joblib"


def predict_task_time(task_type: str, weather: str, operator_skill: str, machine_age_years: int) -> float:
    """Predict task completion duration in minutes using trained pipeline or heuristic fallback."""
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        df_input = pd.DataFrame([{
            "task_type": task_type,
            "weather": weather,
            "operator_skill": operator_skill,
            "machine_age_years": machine_age_years,
        }])
        pred = model.predict(df_input)
        return float(round(pred[0], 1))

    # Fallback heuristic if model artifact is not yet trained
    base_times = {"Excavation": 180, "Trenching": 120, "Loading": 90, "Grading": 150, "Demolition": 240}
    weather_multiplier = {"Sunny": 1.0, "Cloudy": 1.05, "Windy": 1.15, "Rainy": 1.30}
    skill_multiplier = {"Expert": 0.85, "Intermediate": 1.0, "Beginner": 1.25}

    base = base_times.get(task_type, 120)
    w_mult = weather_multiplier.get(weather, 1.0)
    s_mult = skill_multiplier.get(operator_skill, 1.0)
    age_mult = 1.0 + (machine_age_years * 0.02)
    return round(base * w_mult * s_mult * age_mult, 1)

