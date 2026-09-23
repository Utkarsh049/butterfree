"""Model training script for Task Time Estimation."""

import os
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from data_generator import generate_task_data
from preprocess import CATEGORICAL_FEATURES, NUMERICAL_FEATURES, build_preprocessor

MODEL_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "saved_models"
MODEL_OUTPUT_PATH = MODEL_OUTPUT_DIR / "task_time_model.joblib"


def train_model(num_samples: int = 1000):
    """Train RandomForest regression model and save pipeline artifact."""
    print("Generating synthetic task training data...")
    df = generate_task_data(num_samples=num_samples)

    features = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
    X = df[features]
    y = df["actual_time_min"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            ("regressor", RandomForestRegressor(n_estimators=100, random_state=42)),
        ]
    )

    print("Fitting model pipeline...")
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = root_mean_squared_error(y_test, predictions)

    print(f"Validation MAE: {mae:.2f} mins")
    print(f"Validation RMSE: {rmse:.2f} mins")

    MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    print(f"Saved trained model to {MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    train_model()

