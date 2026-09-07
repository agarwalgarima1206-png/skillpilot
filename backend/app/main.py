from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="SkillPilot API",
    description="AI-powered Job Resilience Analyzer",
    version="1.0.0"
)

# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Request Model
# -----------------------------

class JobInput(BaseModel):
    job_title: str
    skills: List[str]
    industry: str
    experience: int


# -----------------------------
# Home / Health Check
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "SkillPilot Backend is running!",
        "status": "success"
    }


# -----------------------------
# Analyze Job
# -----------------------------

@app.post("/analyze")
def analyze_job(data: JobInput):

    return {
        "job_title": data.job_title,
        "industry": data.industry,
        "experience": data.experience,
        "skills": data.skills,

        "automatable_tasks": [
            "Repetitive data entry",
            "Basic reporting",
            "Routine documentation"
        ],

        "valuable_future_skills": [
            "AI & Machine Learning",
            "Data Analysis",
            "Problem Solving",
            "Communication"
        ],

        "skills_to_learn": [
            "Artificial Intelligence",
            "Advanced Data Analysis",
            "Cloud Computing"
        ],

        "alternative_roles": [
            "AI Specialist",
            "Data Analyst",
            "AI Product Specialist"
        ],

        "roadmap": {
            "3_months": "Build fundamentals and complete beginner projects",
            "6_months": "Develop advanced skills and real-world projects",
            "12_months": "Apply for internships and AI-related roles"
        }
    }
