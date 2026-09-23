"""Synthetic task data generator for machine learning model training."""

import random
import pandas as pd

TASK_TYPES = ["Excavation", "Trenching", "Loading", "Grading", "Demolition"]
WEATHER_CONDITIONS = ["Sunny", "Rainy", "Cloudy", "Windy"]
SKILL_LEVELS = ["Beginner", "Intermediate", "Expert"]

BASE_TASK_TIMES = {
    "Excavation": 180,
    "Trenching": 120,
    "Loading": 90,
    "Grading": 150,
    "Demolition": 240,
}

WEATHER_IMPACT = {
    "Sunny": 1.0,
    "Cloudy": 1.05,
    "Windy": 1.15,
    "Rainy": 1.30,
}

SKILL_IMPACT = {
    "Expert": 0.85,
    "Intermediate": 1.0,
    "Beginner": 1.25,
}


def generate_task_data(num_samples: int = 500, seed: int = 42) -> pd.DataFrame:
    """Generate synthetic task records with realistic variances."""
    random.seed(seed)
    records = []

    for idx in range(num_samples):
        task_type = random.choice(TASK_TYPES)
        weather = random.choice(WEATHER_CONDITIONS)
        skill = random.choice(SKILL_LEVELS)
        machine_age = random.randint(1, 10)

        base_time = BASE_TASK_TIMES[task_type]
        weather_factor = WEATHER_IMPACT[weather]
        skill_factor = SKILL_IMPACT[skill]
        age_factor = 1.0 + (machine_age * 0.02)  # older machines are slightly slower
        noise = random.uniform(0.92, 1.08)

        estimated_time = int(base_time * weather_factor * skill_factor)
        actual_time = int(base_time * weather_factor * skill_factor * age_factor * noise)

        records.append({
            "task_id": f"TSK-SYN-{idx + 1:04d}",
            "task_type": task_type,
            "weather": weather,
            "operator_skill": skill,
            "machine_age_years": machine_age,
            "estimated_time_min": estimated_time,
            "actual_time_min": actual_time,
        })

    return pd.DataFrame(records)


if __name__ == "__main__":
    df = generate_task_data(100)
    print(f"Generated {len(df)} sample records:")
    print(df.head())

