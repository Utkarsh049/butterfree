"""Data preprocessing and feature pipeline for Task Time Estimation."""

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CATEGORICAL_FEATURES = ["task_type", "weather", "operator_skill"]
NUMERICAL_FEATURES = ["machine_age_years"]


def build_preprocessor() -> ColumnTransformer:
    """Build scikit-learn ColumnTransformer for feature encoding and scaling."""
    return ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("num", StandardScaler(), NUMERICAL_FEATURES),
        ]
    )

