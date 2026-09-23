"""In-memory data store with seed capability for local execution."""

import json
from pathlib import Path
from typing import Dict, List
from ..models.task import Task
from ..models.telemetry import Telemetry
from ..models.alert import Alert

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"

TASKS_DB: Dict[str, Task] = {}
TELEMETRY_DB: List[Telemetry] = []
ALERTS_DB: List[Alert] = []


def seed_database():
    """Seed in-memory database with sample JSON datasets if available."""
    tasks_file = DATA_DIR / "sample_tasks.json"
    telemetry_file = DATA_DIR / "sample_telemetry.json"

    if tasks_file.exists():
        with open(tasks_file, "r") as f:
            data = json.load(f)
            for item in data:
                TASKS_DB[item["task_id"]] = Task(**item)

    if telemetry_file.exists():
        with open(telemetry_file, "r") as f:
            data = json.load(f)
            for item in data:
                TELEMETRY_DB.append(Telemetry(**item))

