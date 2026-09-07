# SkillPilot

SkillPilot is a hackathon MVP for **AI-era career and skill-gap guidance**. A user chooses one of three O*NET-backed roles, completes a short adaptive calibration chat, receives a skill-gap profile with depth recommendations, and gets a 90-day roadmap.

## What is working

- 3 roles from the included O*NET-derived `backend/app/data/dataset.json`
- Dynamic role explorer and role detail pages
- Guided role-specific chat with backend-managed sessions
- User answers are converted into deterministic skill-level signals
- Skill-gap analysis with FutureProof score
- Depth calls: `MASTER`, `AI-AUGMENT`, `BASIC-AWARENESS`
- Personalized 90-day roadmap
- Local session persistence in the browser
- Clean frontend/backend API contract
- No external LLM or database is required for the demo, so the core flow works offline after dependencies are installed

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Python + FastAPI + Pydantic
- Data: JSON dataset containing O*NET occupation evidence

## Project structure

```text
skillpilot/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── data/dataset.json
│   │   └── main.py
│   └── requirements.txt
└── docs/
```

## Run locally

### 1. Backend

Windows PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Mac/Linux:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000`
API docs: `http://127.0.0.1:8000/docs`

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

If needed, create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Demo flow

```text
Landing
  ↓
Explore role
  ↓
Role detail
  ↓
4-question calibration chat
  ↓
Skill-gap analysis
  ↓
90-day roadmap
```

For a hackathon demo, use **Data Scientist** first: it clearly shows the Human-Core / AI-Augment / AI-Accelerated depth framework.

## API

- `GET /health`
- `GET /roles`
- `GET /roles/{role_id}`
- `POST /chat/start`
- `POST /chat/reply`
- `GET /skill-gap/{session_id}`
- `GET /roadmap/{session_id}`

See `docs/api-contract.md` for the response shapes.
