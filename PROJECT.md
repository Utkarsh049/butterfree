# PROJECT.md — Smart Operator Assistant for CAT Machinery

## 1. Overview

An intelligent, end-to-end application that supports CAT machine operators throughout their workday — improving efficiency, safety, and training using smart technologies built on real operator and machine data.

## 2. Problem Statement (Recap)

Design and build a multi-functional operator interface for CAT machine operators — an intelligent companion, not just a tool.

**Expected Outcomes:**
1. Daily task dashboard (with offline-first local caching and syncing)
2. Safety features (seatbelt compliance, proximity hazards, and **inference-based fatigue/drowsiness detection**)
3. Operator training hub
4. Anomaly detection & **Digital Twin / Machine Health Score** (predictive maintenance)
5. **Explainable task time estimation** (ML-based with feature breakdown: weather, skill, age)

## 3. System Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend       │◄────►│   Backend API     │◄────►│   Database       │
│  (Dashboard UI)  │      │ (Business Logic)  │      │ (Tasks, Logs,    │
│                  │      │                   │      │  Users, Alerts)  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │   ML Model        │
                          │ (Time Estimation, │
                          │  Anomaly Detection)│
                          └──────────────────┘
```

### 3.1 Offline-First Architecture & Connectivity Resilience

Construction and excavation sites (quarries, remote roads, deep foundations) frequently face poor cellular connectivity and dead zones. The architecture is built with an offline-first design:
- **Local Task Caching**: The frontend dashboard automatically caches the shift's assigned tasks, safety protocols, and operational guidelines locally in browser storage (IndexedDB / LocalStorage).
- **Outbox Telemetry Queue**: When machine connectivity drops, telemetry readings, operator logs, and incident reports are safely buffered in an offline outbox queue.
- **Resilient Auto-Sync**: When network connectivity is re-established, the background sync manager batch-syncs all buffered events to the backend API without data loss or operator interruption.

## 4. Data Design

### 4.1 Task Data (Dashboard + Time Estimation)
| Field | Type | Notes |
|---|---|---|
| Task ID | string | Unique identifier |
| Task Type | enum | Excavation, Trenching, Loading, Grading, Demolition |
| Weather | enum | Sunny, Rainy, Cloudy, Windy |
| Operator Skill | enum | Beginner, Intermediate, Expert |
| Machine Age (yrs) | int | |
| Estimated Time (min) | int | Baseline planned duration |
| Actual Time (min) | int | Ground truth — used as ML training target |

### 4.2 Telemetry Data (Safety + Anomaly Detection)
| Field | Type | Notes |
|---|---|---|
| Timestamp | datetime | |
| Machine ID | string | |
| Operator ID | string | |
| Engine Hours | float | Cumulative usage |
| Fuel Used (L) | float | |
| Load Cycles | int | |
| Idling Time (min) | int | Feeds anomaly detection |
| Seatbelt Status | enum | Fastened / Unfastened |
| Proximity Distance (m) | float | Sensor distance to closest obstacle (< 3m triggers hazard) |
| Continuous Run Hours | float | Hours worked without an active break (feeds fatigue inference) |
| Safety Alert Triggered | bool | Yes / No |

### 4.3 Assumed / To-Be-Defined
- **Proximity hazard data**: assume a proximity radar/sensor feed (distance in meters, timestamped) with < 3m alert threshold.
- **Working conditions**: visibility, ground compactness, or ambient noise level can be extended as optional fields.

### 4.4 Inferred & Explainability Metrics
- **Fatigue / Drowsiness Indicator**: Inferred flag (Normal / Fatigued / Take Break) derived from continuous run streaks, erratic cycle rates, and micro-idling late in shift.
- **Machine Health Score (0–100)**: Composite index aggregating engine hours, idle ratio, fuel consumption rate, and load cycle stress into a predictive maintenance score.
- **Explainability Breakdown**: Structured delta offsets for task estimation:
  `Predicted Duration = Base Time + Δ(Weather) + Δ(Operator Skill) + Δ(Machine Age)`

## 5. Module Breakdown

| Module | Owner (assign) | Description |
|---|---|---|
| Frontend Dashboard | TBD | Task view, safety alerts UI, training hub, offline task caching & telemetry sync |
| Backend API | TBD | REST endpoints for tasks, telemetry, alerts, and sync management |
| Safety Engine | TBD | Seatbelt, proximity alerts, + **telemetry inference for fatigue/drowsiness detection (break nudges)** |
| Anomaly Detection & Digital Twin | TBD | Rule-based idling/usage checks + **Machine Health Score (0–100 predictive maintenance index)** |
| ML Time Estimator & XAI | TBD | Regression model + **Explainable AI feature breakdown (weather, skill, machine age deltas)** |
| Training Hub | TBD | Static/e-learning content, booking flow, or simulation stub |

## 6. ML Approach (Task Time Estimation & Explainability)

- **Input features**: Task Type, Weather, Operator Skill, Machine Age
- **Target**: Actual Time
- **Approach**: Start simple — Linear Regression / Random Forest baseline, since sample size is small. Generate synthetic data (varying combinations of the above features) to have enough rows to train meaningfully.
- **Evaluation**: Compare predicted vs. Estimated Time vs. Actual Time (MAE/RMSE).

### 6.1 Explainable Time Predictions (Feature Attribution / XAI)
Instead of returning an opaque, black-box duration number, the system explains **why** the prediction was made by decomposing the final estimate into transparent feature impacts:
- **Baseline Duration**: Planned duration for the selected `Task Type` under ideal baseline conditions.
- **Delta Impact Factors**:
  - $\Delta t_{\text{weather}}$: e.g., `+15 min due to Rainy weather` (reduced traction, slower cycle speeds).
  - $\Delta t_{\text{skill}}$: e.g., `+10 min due to Beginner skill` or `-10 min due to Expert skill`.
  - $\Delta t_{\text{machine\_age}}$: e.g., `+5 min due to Machine Age (7 yrs)`.
- **Operator-Facing Output**:
  > *"Estimated 65 min — +15 min due to Rainy weather, +5 min due to Intermediate skill level, +0 min due to modern machine."*
- **Value**: High-impact demonstration feature that builds operator trust and gives evaluators tangible Explainable AI (XAI) rather than a black box.

## 7. Safety Inference, Anomaly Detection & Digital Twin

### 7.1 Baseline Anomaly Detection Logic
- Idling Time > threshold (e.g., 45 min) → flag "excessive idling"
- Seatbelt Unfastened + Safety Alert Triggered = Yes → flag "safety incident"
- Sudden drop in Load Cycles with high Engine Hours → flag "unusual usage pattern"
- (Optional stretch) Use a simple statistical outlier method (z-score/IQR) on idling time and fuel usage per operator.

### 7.2 Fatigue / Drowsiness Detection Logic (Inference-Based Safety)
Safety systems shouldn't rely solely on binary physical switches (like seatbelts). By analyzing telemetry patterns across a shift, the system infers cognitive/physical fatigue:
- **Continuous Operating Streak**: Engine running continuously for $> 3.0$ hours without an engine-off or idle rest period.
- **Erratic Load Cycles Late in Shift**: Inconsistent cycle duration or sudden high variance in load cycles after hour 5 of a shift (signals slowing reflexes or hesitation).
- **Creeping Micro-Idling**: Repeated, irregular short idling gaps between cycles indicating loss of rhythm or drowsiness.
- **Action / Interventions**: Proactively trigger a supportive operator nudge:
  > *"Safety Nudge: 3.5 hrs of continuous high-load operation detected with irregular cycle rhythms. Time for a 15-minute rest & hydration break."*

### 7.3 Digital Twin / Machine Health Score (Predictive Maintenance)
To emulate a true CAT machinery companion, the system synthesizes multiple telemetry dimensions into a single dynamic **Machine Health Score (0–100)** — operating like a "credit score" for the excavator:
- **Core Health Components**:
  - **Idling Ratio**: Excessive idling increases engine carbon build-up and degrades fuel economy.
  - **Fuel Burn Efficiency**: Liters per hour / load cycle vs. expected manufacturer baselines.
  - **Mechanical Stress / Load Cycles**: Extreme cycle frequencies or shock loads indicating premature wear.
  - **Cumulative Operating Hours**: Proximity to scheduled CAT service milestones (e.g., 250h, 500h, 1000h filter/hydraulic checks).
- **Health Rating Bands**:
  - **85–100 (Optimal)**: Machine running efficiently with healthy component life.
  - **65–84 (Attention Required)**: Sub-optimal fuel burn or elevated idling; preventive inspection suggested.
  - **< 65 (Maintenance Required / High Risk)**: Flags immediate maintenance needs to prevent costly job-site breakdown.
- **Value**: Extends basic anomaly detection into proactive predictive maintenance — a direct commercial value driver for CAT equipment owners.

## 8. Team Collaboration & Workflow (Streamlining Across Users)

### 8.1 Repository Strategy
Single monorepo (see README.md structure) — everyone works in one repo with folder-based ownership.

### 8.2 Branching Model
```
main            → stable, demo-ready code only
develop         → integration branch
feature/<name>  → individual feature branches (e.g., feature/safety-alerts)
```

**Rules:**
- Never commit directly to `main`.
- Branch off `develop`, open a PR back into `develop`.
- Merge to `main` only before demo/deployment checkpoints.

### 8.3 Commit Convention
```
feat: add seatbelt compliance check
fix: correct idling threshold calculation
docs: update README setup steps
chore: add .env.example
```

### 8.4 Task Division (suggested by module ownership)
- Assign each teammate one module from Section 5.
- Use GitHub Issues / a shared Kanban board (Trello/Notion) to track task status: `To Do → In Progress → Review → Done`.

### 8.5 Environment Consistency
- Shared `.env.example` file — never commit real `.env` files.
- Pin dependency versions in `package.json` / `requirements.txt` so everyone runs identical versions.
- Document any manual setup step (e.g., local DB seeding) in README.

### 8.6 Code Review
- Every PR needs at least 1 teammate review before merging into `develop`.
- Keep PRs small and scoped to one feature/fix.

### 8.7 Communication
- Daily/async standup: what was done, what's next, blockers.
- Shared doc (this file) updated whenever architecture or data assumptions change.

## 9. Milestones (adjust to your timeline)

| Phase | Deliverable |
|---|---|
| Day 1 | Repo setup, data modeling, wireframes |
| Day 2 | Core backend + dashboard UI + safety rules |
| Day 3 | ML model integration, anomaly detection, training hub |
| Day 4 | Testing, polish, deployment, demo prep |

## 10. Open Questions / Assumptions Log

- Proximity hazard data source — assumed simulated sensor feed.
- Training hub format — decide: video links vs. booking form vs. simulation mockup.
- Scale of synthetic data needed for ML — TBD based on model performance.