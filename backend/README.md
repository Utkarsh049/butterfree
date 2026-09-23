# Backend API & Engines

FastAPI backend providing REST endpoints for tasks, real-time machine telemetry, safety compliance evaluation, and operational anomaly detection.

## Structure
- `app/main.py`: Application entry point with CORS and lifespan database seeding.
- `app/core/`: Configuration and threshold definitions.
- `app/api/v1/`: Endpoints for `tasks`, `telemetry`, `alerts`, and `training`.
- `app/services/`: Safety Engine, Anomaly Detector, and ML Estimation service.
- `app/models/`: Pydantic models for Task, Telemetry, and Alert structures.
- `app/db/`: In-memory data store with JSON seeders.
- `tests/`: Pytest unit tests for safety rules and anomaly detection.

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
3. Interactive API documentation is available at `http://localhost:8000/docs`.

4. Run tests:
   ```bash
   pytest
   ```

