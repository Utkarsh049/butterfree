# Machine Learning Model: Task Time Estimator

This module provides a regression model to estimate task completion duration based on:
- **Task Type** (Excavation, Trenching, Loading, Grading, Demolition)
- **Weather Condition** (Sunny, Rainy, Cloudy, Windy)
- **Operator Skill Level** (Beginner, Intermediate, Expert)
- **Machine Age** (Years)

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Train the model:
   ```bash
   python src/train.py
   ```
3. The trained artifact is stored at `saved_models/task_time_model.joblib`.

