from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SkillPilot API")


class JobAnalysisRequest(BaseModel):
    dream_job: str
    skills: list[str]
    experience: str
    industry: str


@app.get("/")
def home():
    return {
        "message": "SkillPilot Backend is running!"
    }


@app.post("/analyze-job")
def analyze_job(request: JobAnalysisRequest):
    return {
        "message": "Job analysis request received!",
        "dream_job": request.dream_job,
        "skills": request.skills,
        "experience": request.experience,
        "industry": request.industry
    }
