# Smart Operator Assistant for CAT Machinery

An end-to-end intelligent companion app for operators of CAT (Caterpillar) construction machinery — designed to improve **efficiency, safety, and training** throughout the operator's workday.

---

##  Problem Statement

Construction equipment like excavators and loaders is becoming increasingly digitalized, but the tools available to operators remain basic. This project builds a multi-functional operator interface that goes beyond a simple tool — an intelligent assistant that supports operators throughout their day.

##  Features

| Feature | Description |
|---|---|
|  **Daily Task Dashboard** | View scheduled tasks for the day at a glance |
|  **Safety Features** | Real-time seatbelt compliance, proximity hazard alerts, and incident logging |
|  **Operator Training Hub** | E-learning videos, instructor booking, or simulation modules |
|  **Anomaly Detection** | Flags unusual machine usage — excessive idling, unsafe operation patterns |
|  **Task Time Estimation** | Predicts task completion time using past data + environmental conditions (ML-based) |

##  Tech Stack

- **Frontend:** React 18 + Vite (dev server on port 3000)
- **Backend:** Python FastAPI + Uvicorn (API at `http://localhost:8000/api/v1`, docs at `/docs`)
- **Database:** In-memory store seeded from `data/*.json` (`DATABASE_URL` optional)
- **ML Model:** Python — scikit-learn RandomForest (`saved_models/task_time_model.joblib`)
- **Deployment:** [Vercel / Render / Docker]

##  Repository Structure

```
smart-operator-assistant/
├── frontend/         # Operator dashboard UI
├── backend/          # API, safety logic, anomaly detection
├── ml-model/         # Task time estimation model
├── data/             # Sample + synthetic datasets
├── docs/             # Additional documentation, diagrams
├── PROJECT.md         # Detailed project design & architecture
├── API.md             # API endpoints, data models & movement contracts
└── README.md          # You are here
```

##  Getting Started

### Prerequisites
- Node.js ≥ 18.x
- Python ≥ 3.10
- Git

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/<org>/smart-operator-assistant.git
cd smart-operator-assistant

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies (Python/FastAPI, not npm)
cd ../backend
pip install -r requirements.txt

# 4. Install ML dependencies
cd ../ml-model
pip install -r requirements.txt

# 5. Set up environment variables
cp .env.example .env
# Fill in required values (DB URL, API keys, etc.)
```

### Running Locally

```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Start frontend (new terminal)
cd frontend
npm run dev

# Run ML model training
cd ml-model
python src/train.py
```

Frontend runs at `http://localhost:3000`, backend API at `http://localhost:8000/api/v1` (docs at `http://localhost:8000/docs`).
