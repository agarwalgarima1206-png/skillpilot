# SkillPilot Architecture

```text
O*NET-derived JSON dataset
          │
          ▼
   FastAPI role layer
          │
          ├── role metadata + evidence
          ├── role-specific chat questions
          └── deterministic calibration/scoring
          │
          ▼
       React frontend
          │
          ├── Explore
          ├── Role Detail
          ├── Calibration Chat
          ├── Skill Gap
          └── 90-Day Roadmap
```

The dataset provides occupation evidence. The SkillPilot product layer maps that evidence to three learning-depth calls: **MASTER**, **AI-AUGMENT**, and **BASIC-AWARENESS**.

For the hackathon MVP, chat sessions are held in backend memory and the latest session is persisted in browser `localStorage`. PostgreSQL and an external LLM are intentionally not required for the core demo path; they can be added later without changing the main UI flow.
