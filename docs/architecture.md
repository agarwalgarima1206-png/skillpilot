# SkillPilot architecture

## Persistence

SQLite is the local source of truth and is created automatically at `backend/app/skillpilot.db` unless `SKILLPILOT_DB_PATH` is set.

Core tables:

- `users` — account, profile and learning preferences
- `analyses` — every assessment session and its saved results
- `chat_messages` — complete per-assessment conversation history
- `roadmaps` — versioned roadmaps; old versions are archived, not overwritten

The frontend never relies on History to retrieve current data. Chat, Skill Gap and Roadmap each load the authenticated user's current data directly from the backend.

## AI boundary

The LLM is used for qualitative evaluation/personalization. Deterministic backend logic owns the final resilience formula, persistence, roadmap structure and progress state.
