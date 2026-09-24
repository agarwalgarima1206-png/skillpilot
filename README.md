# SkillPilot 🚀

### AI-Powered Career Guidance, Skill-Gap Analysis & Personalized Learning

SkillPilot is an AI-powered career and learning guidance platform designed to help students understand **where they are, where they want to go, and what they should do next**.

It combines adaptive assessments, AI-driven skill-gap analysis, personalized learning roadmaps, resilience analysis, early-warning signals, and an AI career assistant into one unified platform.

---

## 🌟 What SkillPilot Does

SkillPilot follows a continuous learning and career-development workflow:

```text
Choose Target Career
        ↓
AI Assessment
        ↓
Current Skill & Resilience Analysis
        ↓
Skill-Gap Identification
        ↓
Personalized Learning Roadmap
        ↓
Learning Progress Tracking
        ↓
Early-Warning Detection
        ↓
AI Guidance & Intervention
```

Instead of giving students a static list of courses, SkillPilot adapts guidance according to their **current skills, performance, learning activity, goals, and progress**.

---

## ✨ Key Features

### 🎯 Career Selection

Students select a target career or role and receive guidance based on the skills and competencies associated with that career.

---

### 🧠 Adaptive AI Assessment

SkillPilot evaluates the learner's current knowledge through assessments designed around their selected career path.

The assessment helps establish a baseline for:

* Technical skills
* Conceptual understanding
* Career readiness
* Learning consistency
* Current strengths and weaknesses

---

### 📊 Skill-Gap Analysis

The platform compares the learner's current capabilities with the requirements of their target career.

It identifies:

* Existing strengths
* Missing skills
* Priority skill gaps
* Skills that should be learned next

This creates a more personalized learning path instead of a generic curriculum.

---

### 🗺️ Personalized Learning Roadmap

SkillPilot generates a structured roadmap based on the learner's identified skill gaps.

Roadmaps can include:

* Learning phases
* Individual skills
* Tasks and milestones
* Learning resources
* Progress tracking
* Recommended learning sequence

Users can work with different roadmap durations such as **3 months, 6 months, or customized timelines**.

---

### 🛡️ AI Resilience Analysis

SkillPilot includes an **AI Resilience Score** designed to represent how consistently a learner is progressing toward their target career.

The score can incorporate signals such as:

* Skill-gap severity
* Assessment activity
* Submission consistency
* Learning-platform engagement
* Recent performance

The purpose is not to label a student, but to identify when additional support or intervention may be useful.

---

### ⚠️ Early-Warning System

SkillPilot includes an early-warning layer for detecting potential learning-risk signals.

The current MVP uses an **assessment-based predictive baseline trained on the Open University Learning Analytics Dataset (OULAD)**.

Relevant learning signals include:

* Assessment activity
* Submission consistency
* VLE engagement
* Recent performance
* Skill-gap indicators

When risk signals increase, SkillPilot can provide earlier guidance instead of waiting until the learner has already fallen significantly behind.

---

### 🤖 AI Career Assistant

The integrated AI assistant allows students to ask questions about:

* Career paths
* Skills
* Learning resources
* Roadmap tasks
* Skill gaps
* Technical concepts
* Career preparation

Past conversations can also be retained as part of the learner's guidance history.

---

## 📚 OULAD-Based Early-Warning Model

SkillPilot's early-warning prototype uses the **Open University Learning Analytics Dataset (OULAD)** to build a predictive baseline.

### Dataset Used

The current pipeline works with datasets including:

* `studentInfo.csv`
* `studentVle.csv`
* `vle.csv`
* `studentAssessment.csv`
* `assessments.csv`

The feature-engineering pipeline produces a learner-level dataset for predictive modelling.

### Current Model

The MVP uses a **logistic regression benchmark** referred to as the ED-02 model in the project.

Current validation metrics:

| Metric             | Result |
| ------------------ | -----: |
| AUROC              | 0.8717 |
| AUPRC              | 0.9027 |
| Brier Score        | 0.1446 |
| Predictive Utility | 0.8872 |

These results represent the performance of the current OULAD benchmark pipeline and should not be interpreted as a guarantee of performance on real-world SkillPilot users.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Student        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │  UI + Dashboard     │
                    └──────────┬──────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────┐      ┌──────────────┐     ┌─────────────┐
   │ AI Services │      │ ML Services  │     │ PostgreSQL  │
   │ Gemini/LLM  │      │ OULAD Model  │     │  Database   │
   └─────────────┘      └──────────────┘     └─────────────┘
          │                    │
          ▼                    ▼
   Career Guidance       Early Warning
   Roadmap Generation    Risk Signals
   AI Assistant          Predictions
```

---

## 🧩 Core Workflow

### 1. Choose a Career

The student selects their desired career or professional role.

### 2. Assess

The platform evaluates the student's current knowledge and learning profile.

### 3. Identify

SkillPilot determines the gap between the student's current capabilities and their target role.

### 4. Plan

AI generates a personalized roadmap with learning phases, tasks, and resources.

### 5. Learn

The student follows the roadmap and tracks completed activities.

### 6. Monitor

SkillPilot continuously evaluates available learning and performance signals.

### 7. Intervene

If early-warning signals indicate potential difficulty, the platform can surface guidance and recommended actions.

### 8. Assist

The AI assistant remains available throughout the process for career and learning-related questions.

---

## 🛠️ Technology Stack

### Frontend

* React
* JavaScript / TypeScript
* Tailwind CSS
* Responsive UI

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy

### AI

* Google Gemini API
* LLM-based career and roadmap generation
* AI conversational assistant

### Machine Learning

* Python
* Scikit-learn
* Logistic Regression
* OULAD
* Joblib

### Database

* PostgreSQL
* SQLAlchemy ORM

### Development Tools

* Git
* GitHub
* VS Code
* Uvicorn

---

## 📁 Project Structure

```text
skillpilot/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── ml/
│   │   ├── oulad/
│   │   ├── artifacts/
│   │   ├── validate_oulad.py
│   │   ├── train.py
│   │   └── predict.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── README.md
└── ...
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Python 3.10+
* Node.js
* npm
* PostgreSQL
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/skillpilot.git
cd skillpilot
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```powershell
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/skillpilot
GEMINI_API_KEY=your_gemini_api_key
```

Add any additional environment variables required by your local configuration.

**Do not commit `.env` or API keys to GitHub.**

---

### 4. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the local URL shown by Vite.

---

## 🧪 Machine Learning Pipeline

The OULAD pipeline can be executed independently.

### Validate Dataset

```bash
python -m ml.validate_oulad
```

### Build / Train Model

```bash
python -m ml.train \
    --data-dir ml/oulad \
    --output-dir ml/artifacts
```

### Generate Predictions

```bash
python -m ml.predict
```

The trained artifacts are stored under:

```text
ml/artifacts/
```

---

## 📈 Current MVP Status

### Implemented

* Career selection workflow
* AI-based assessment
* Skill-gap analysis
* Personalized roadmap generation
* Roadmap progress tracking
* AI career assistant
* User authentication and profile flow
* PostgreSQL-backed application data
* OULAD dataset validation pipeline
* OULAD feature engineering
* Logistic regression early-warning benchmark
* Prediction and attribution pipeline
* Early-warning service
* Learning-risk signals
* AI resilience analysis

### In Development / Future Scope

* More sophisticated adaptive assessments
* Improved personalization using longitudinal learner data
* More robust predictive models
* Real-time learning analytics
* Additional career domains
* Deeper resource recommendation
* Automated roadmap adaptation
* More advanced intervention strategies
* Larger-scale deployment and evaluation

---

## 🔐 Privacy & Security

SkillPilot is designed around responsible handling of learner information.

Key principles include:

* Authentication for user-specific data
* Environment variables for API credentials
* Separation of application and ML data
* No API keys committed to source control
* Controlled access to learner-specific information

The OULAD dataset is used as a research/benchmark dataset and is separate from personal learner data generated by the application.

---

## 🎯 Vision

SkillPilot aims to move career guidance from:

> **"Here is a course. Complete it."**

to:

> **"Here is where you want to go, here is where you currently stand, here is the gap, and here is what you should work on next."**

The long-term goal is to build an intelligent learning companion that continuously understands a learner's progress and helps them make better-informed decisions throughout their career journey.

---

## 👩‍💻 Built For

**SkillPilot** was developed as an AI-powered career and learning guidance MVP for a hackathon project.

### Team

Built with ❤️ by the SkillPilot team.
