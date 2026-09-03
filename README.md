# SkillPilot

AI-powered career and skill navigation tool. Users input a dream job and current skills, and get back a task breakdown (Human-Core / AI-Augmented / AI-Accelerated), an AI-Resilience Score, skill-gap analysis, and a personalized learning roadmap with recommended depth per skill.

Built for the JECRC Hackathon (Sept 12–13).

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL
- **AI:** LLM API integration

## Team
- Komal & Garima — Frontend
- Anushree — Backend
- All three switch to backend once screens are built

## Folder Structure
```
skillpilot/
├── frontend/       # React + Tailwind app
├── backend/        # FastAPI app
├── docs/           # API contract + architecture notes
└── README.md
```
See `docs/architecture.md` for full data flow and `docs/api-contract.md` for endpoint specs.

---

## Setup — Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

Create a `.env` file in `frontend/` (not committed to git) with:
```
VITE_API_URL=http://localhost:8000
```

## Setup — Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
- **Windows (PowerShell):** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in `backend/` (not committed to git) with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/skillpilot
LLM_API_KEY=your_key_here
```

Run the server:
```bash
uvicorn app.main:app --reload
```
Runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

---

## Git Workflow

1. Pull latest before starting work:
   ```bash
   git pull origin main
   ```
2. Make your changes.
3. Stage, commit, push:
   ```bash
   git add .
   git commit -m "short description of what you did"
   git push origin main
   ```

If you hit a merge conflict, ping the team before force-pushing anything.

## Where things go
- New frontend screens → `frontend/src/pages/`
- Reusable UI pieces → `frontend/src/components/`
- API call functions → `frontend/src/services/api.js`
- Fake data for building UI before backend is ready → `frontend/src/mocks/`
- New backend routes → `backend/app/api/`
- Scoring/roadmap logic → `backend/app/services/`
- Dataset → `backend/app/data/futureproof_dataset.json`
