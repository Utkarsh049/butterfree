# PROJECT.md — Smart Operator Assistant for CAT Machinery

## 1. Overview

An intelligent, end-to-end application that supports CAT machine operators throughout their workday — improving efficiency, safety, and training using smart technologies built on real operator and machine data.

## 2. Problem Statement (Recap)

Design and build a multi-functional operator interface for CAT machine operators — an intelligent companion, not just a tool.

**Expected Outcomes:**
1. Daily task dashboard
2. Safety features (seatbelt compliance, proximity hazards, incident logging)
3. Operator training hub
4. Anomaly detection (excessive idling, unsafe operation)
5. Task time estimation (ML-based, using past data + environmental conditions)

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
| Safety Alert Triggered | bool | Yes / No |

### 4.3 Assumed / To-Be-Defined
- **Proximity hazard data**: not in sample set — assume a proximity sensor feed (distance in meters, timestamped) and define a threshold-based alert (e.g., < 3m triggers alert).
- **Working conditions**: assume visibility, terrain type, or noise level can be added as optional fields.

## 5. Module Breakdown

| Module | Owner (assign) | Description |
|---|---|---|
| Frontend Dashboard | TBD | Task view, safety alerts UI, training hub UI |
| Backend API | TBD | REST endpoints for tasks, telemetry, alerts |
| Safety Engine | TBD | Rule-based checks: seatbelt, proximity, incident logging |
| Anomaly Detection | TBD | Rule-based or statistical outlier detection on idling/usage |
| ML Time Estimator | TBD | Regression model trained on Task Data |
| Training Hub | TBD | Static/e-learning content, booking flow, or simulation stub |

## 6. ML Approach (Task Time Estimation)

- **Input features**: Task Type, Weather, Operator Skill, Machine Age
- **Target**: Actual Time
- **Approach**: Start simple — Linear Regression / Random Forest baseline, since sample size is small. Generate synthetic data (varying combinations of the above features) to have enough rows to train meaningfully.
- **Evaluation**: Compare predicted vs. Estimated Time vs. Actual Time (MAE/RMSE).

## 7. Anomaly Detection Logic (Baseline Rules)

- Idling Time > threshold (e.g., 45 min) → flag "excessive idling"
- Seatbelt Unfastened + Safety Alert Triggered = Yes → flag "safety incident"
- Sudden drop in Load Cycles with high Engine Hours → flag "unusual usage pattern"
- (Optional stretch) Use a simple statistical outlier method (z-score/IQR) on idling time and fuel usage per operator.

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