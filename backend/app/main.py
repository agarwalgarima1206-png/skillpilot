from __future__ import annotations

import json
import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "dataset.json"

with DATASET_PATH.open("r", encoding="utf-8") as f:
    DATASET = json.load(f)

RAW_ROLES: list[dict[str, Any]] = DATASET.get("roles", [])

# Product-layer taxonomy. O*NET supplies the occupation/task/skill evidence;
# these mappings are SkillPilot's interpretation of where to invest learning depth.
ROLE_CONFIG: dict[str, dict[str, Any]] = {
    "data-scientist": {
        "title": "Data Scientist",
        "impact": "Balanced impact",
        "description": "AI accelerates routine analysis, while problem framing, statistical judgment and communication remain high-value human work.",
        "skills": [
            ("Critical Thinking", "Human-Core", "MASTER", "Judgment is needed to challenge assumptions, choose methods and interpret uncertainty."),
            ("Mathematics & Statistics", "Human-Core", "MASTER", "Strong statistical reasoning is difficult to outsource safely."),
            ("Experiment Design", "Human-Core", "MASTER", "The quality of the question and experimental design drives the value of the analysis."),
            ("Python & Programming", "AI-Augmented", "AI-AUGMENT", "Use AI for implementation speed while retaining code, testing and architecture judgment."),
            ("SQL & Data Modeling", "AI-Augmented", "AI-AUGMENT", "AI can draft queries; you still need to validate data logic and model relationships."),
            ("Data Visualization", "AI-Augmented", "AI-AUGMENT", "AI can produce charts quickly; you decide what evidence the audience should see."),
            ("Machine Learning", "AI-Augmented", "AI-AUGMENT", "Learn model behavior and validation deeply enough to supervise AI-assisted workflows."),
            ("Routine Reporting", "AI-Accelerated", "BASIC-AWARENESS", "Automated reporting is increasingly cheap; understand the pipeline and verify outputs."),
        ],
        "responsibilities": [
            "Identify business problems that can be answered with data.",
            "Analyze and model data using statistical and computational methods.",
            "Validate models and communicate evidence to stakeholders.",
            "Recommend data-driven actions while accounting for uncertainty.",
        ],
    },
    "software-developer": {
        "title": "Software Developer",
        "impact": "AI-heavy role",
        "description": "Code generation is rapidly accelerating implementation, making architecture, debugging, testing and system-level judgment more important.",
        "skills": [
            ("Complex Problem Solving", "Human-Core", "MASTER", "Understanding ambiguous requirements and choosing trade-offs remains an engineering responsibility."),
            ("Systems Analysis & Design", "Human-Core", "MASTER", "Architecture, constraints and failure modes require system-level reasoning."),
            ("Code Review & Quality", "Human-Core", "MASTER", "Generated code still needs security, correctness, maintainability and performance judgment."),
            ("Programming", "AI-Augmented", "AI-AUGMENT", "Pair with AI for implementation while owning structure, correctness and debugging."),
            ("Testing", "AI-Augmented", "AI-AUGMENT", "AI can generate tests, but engineers decide what must actually be tested."),
            ("DevOps & Cloud", "AI-Augmented", "AI-AUGMENT", "Automate infrastructure work while understanding deployment, observability and failure recovery."),
            ("Documentation", "AI-Accelerated", "BASIC-AWARENESS", "AI can draft documentation; focus on reviewing and maintaining the important parts."),
            ("Boilerplate Implementation", "AI-Accelerated", "BASIC-AWARENESS", "Routine scaffolding is increasingly generated; know enough to inspect and modify it."),
        ],
        "responsibilities": [
            "Design, develop and maintain software applications.",
            "Translate requirements into reliable technical solutions.",
            "Review code, diagnose failures and improve system quality.",
            "Deploy and operate software across development environments.",
        ],
    },
    "ui-ux-designer": {
        "title": "UI/UX Designer",
        "impact": "Balanced impact",
        "description": "AI can generate interface variations quickly, but user understanding, product judgment, interaction decisions and design systems remain critical.",
        "skills": [
            ("User Research", "Human-Core", "MASTER", "Understanding real users and asking the right questions is fundamentally human-centered work."),
            ("Product & Design Judgment", "Human-Core", "MASTER", "Prioritization, taste and trade-offs determine whether a design actually solves the problem."),
            ("Interaction Design", "Human-Core", "MASTER", "Designing coherent behavior across contexts requires deep user and product reasoning."),
            ("Design Systems", "AI-Augmented", "AI-AUGMENT", "AI can speed up component work while you own consistency and system decisions."),
            ("Prototyping", "AI-Augmented", "AI-AUGMENT", "Use AI to explore variants faster, then validate the right interaction."),
            ("Visual Design", "AI-Augmented", "AI-AUGMENT", "AI can generate visual directions; designers curate and refine them against the product context."),
            ("Figma & Production Tools", "AI-Accelerated", "BASIC-AWARENESS", "Tool mechanics are becoming faster to automate; focus on the design decisions behind them."),
            ("Asset & Screen Generation", "AI-Accelerated", "BASIC-AWARENESS", "First-pass screens and assets can increasingly be generated from prompts."),
        ],
        "responsibilities": [
            "Research user needs, behaviors and pain points.",
            "Design intuitive interfaces and interactions.",
            "Prototype, test and iterate with users and product teams.",
            "Maintain coherent visual and interaction systems.",
        ],
    },
}

ROLE_ALIASES = {
    "ui-ux-designer": "ui-ux-designer",
    "uiux-designer": "ui-ux-designer",
    "ux-designer": "ui-ux-designer",
    "web-and-digital-interface-designer": "ui-ux-designer",
}


def slugify(value: str) -> str:
    return value.lower().replace("&", "and").replace("/", "-").replace(" ", "-").replace("(", "").replace(")", "")


def get_role(role_id: str) -> dict[str, Any]:
    role_id = ROLE_ALIASES.get(role_id, role_id)
    if role_id in ROLE_CONFIG:
        return ROLE_CONFIG[role_id]
    raise HTTPException(status_code=404, detail="Role not found")


def get_raw_role(role_id: str) -> dict[str, Any]:
    cfg = get_role(role_id)
    title = cfg["title"]
    for role in RAW_ROLES:
        raw_title = role.get("role_name", "")
        if raw_title == title or slugify(raw_title) == role_id or title in raw_title or raw_title in title:
            return role
    raise HTTPException(status_code=404, detail="Dataset entry not found")


def role_payload(role_id: str) -> dict[str, Any]:
    cfg = get_role(role_id)
    raw = get_raw_role(role_id)
    return {
        "id": role_id,
        "title": cfg["title"],
        "impact_tag": cfg["impact"],
        "description": cfg["description"],
        "onet_soc_code": raw.get("onet_soc_code"),
        "source": raw.get("source"),
        "responsibilities": cfg["responsibilities"],
        "skills": [
            {"name": n, "tier": t, "depth": d, "note": note}
            for n, t, d, note in cfg["skills"]
        ],
        "onet_evidence": {
            "tasks": raw.get("tasks", [])[:6],
            "essential_skills": raw.get("essential_skills", [])[:6],
            "software_skills": raw.get("software_skills", [])[:8],
        },
    }


def level_from_answer(answer: str) -> int:
    a = answer.lower()
    if any(x in a for x in ["daily", "advanced", "from scratch", "independently", "lead", "expert", "strong"]):
        return 78
    if any(x in a for x in ["projects", "regularly", "comfortable", "some experience", "basic scripts", "practical"]):
        return 58
    if any(x in a for x in ["coursework", "basics", "beginner", "need guidance", "learning"]):
        return 35
    return 45


def build_skill_results(role_id: str, answers: dict[str, str]) -> list[dict[str, Any]]:
    cfg = get_role(role_id)
    skills = cfg["skills"]
    avg = sum(level_from_answer(v) for v in answers.values()) / max(len(answers), 1)
    answer_levels = list(answers.values())
    results = []

    for idx, (name, tier, depth, note) in enumerate(skills):
        # Map the limited onboarding answers onto the role skill taxonomy.
        signal = level_from_answer(answer_levels[idx % len(answer_levels)]) if answer_levels else round(avg)
        if depth == "MASTER":
            target = 85
            current = max(15, min(90, round(signal - (8 if idx == 0 else 0))))
        elif depth == "AI-AUGMENT":
            target = 75
            current = max(20, min(92, round(signal + 2)))
        else:
            target = 45
            current = max(20, min(95, round(signal)))
        gap = max(target - current, 0)
        results.append({
            "name": name,
            "tier": tier,
            "depth_call": depth,
            "your_level_pct": current,
            "role_target_pct": target,
            "gap": gap,
            "note": note,
        })
    return results


class ChatStart(BaseModel):
    role_id: str


class ChatReply(BaseModel):
    session_id: str
    answer: str = Field(min_length=1, max_length=1000)


app = FastAPI(title="SkillPilot API", version="1.0.0")

origins = [x.strip() for x in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: dict[str, dict[str, Any]] = {}

QUESTION_TEMPLATES = {
    "data-scientist": [
        ("statistics", "How comfortable are you with statistics and reasoning about uncertainty?", ["I use statistics confidently in projects", "I know the concepts but need practice", "Only coursework so far"]),
        ("python", "How would you describe your Python experience?", ["I build projects from scratch", "I use notebooks and basic scripts", "I mostly need guidance"]),
        ("sql", "How much practical SQL experience do you have?", ["I use SQL regularly in projects", "I know queries and database basics", "I've only studied SQL"]),
        ("ml", "How comfortable are you building or evaluating ML models?", ["I build and validate models myself", "I can follow and modify models", "Mostly coursework or guided work"]),
    ],
    "software-developer": [
        ("programming", "How would you describe your programming experience?", ["I build applications independently", "I build smaller projects with guidance", "Mostly coursework so far"]),
        ("systems", "How comfortable are you with system design and architecture?", ["I can design systems and explain trade-offs", "I understand the basics", "I've only encountered it in coursework"]),
        ("testing", "How do you usually handle testing and debugging?", ["I write tests and debug independently", "I use basic tests and debugging", "I mostly rely on examples or guidance"]),
        ("devops", "How much hands-on experience do you have with deployment or cloud tools?", ["I deploy and operate projects", "I've deployed a few projects", "I've only studied the concepts"]),
    ],
    "ui-ux-designer": [
        ("research", "How much experience do you have conducting user research?", ["I run and synthesize user research", "I've done small research exercises", "Mostly coursework so far"]),
        ("interaction", "How comfortable are you designing user flows and interactions?", ["I design flows independently", "I can create basic flows and prototypes", "I need guidance on interaction design"]),
        ("visual", "How would you describe your visual design experience?", ["I create polished interfaces independently", "I can create solid visual designs", "I'm still learning visual fundamentals"]),
        ("tools", "How comfortable are you with Figma or similar design tools?", ["I use them regularly for projects", "I know the main tools and workflows", "I've only used them in coursework"]),
    ],
}


def question_for(session: dict[str, Any]) -> tuple[str, list[str]]:
    qs = QUESTION_TEMPLATES[session["role_id"]]
    key, question, options = qs[session["index"]]
    return question, options


@app.get("/")
def home():
    return {"message": "SkillPilot API is running", "status": "success"}


@app.get("/health")
def health():
    return {"status": "ok", "roles": len(ROLE_CONFIG)}


@app.get("/roles")
def roles():
    return [
        {
            "id": role_id,
            "title": cfg["title"],
            "impact_tag": cfg["impact"],
            "description": cfg["description"],
            "onet_soc_code": get_raw_role(role_id).get("onet_soc_code"),
        }
        for role_id, cfg in ROLE_CONFIG.items()
    ]


@app.get("/roles/{role_id}")
def role_detail(role_id: str):
    return role_payload(role_id)


@app.post("/chat/start")
def chat_start(data: ChatStart):
    get_role(data.role_id)
    session_id = uuid.uuid4().hex
    sessions[session_id] = {"role_id": data.role_id, "index": 0, "answers": {}}
    question, options = question_for(sessions[session_id])
    return {
        "session_id": session_id,
        "message": f"Let's calibrate your current depth for {get_role(data.role_id)['title']}. {question}",
        "quick_replies": options,
        "done": False,
    }


@app.post("/chat/reply")
def chat_reply(data: ChatReply):
    session = sessions.get(data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found. Start a new analysis.")

    qs = QUESTION_TEMPLATES[session["role_id"]]
    key, _, _ = qs[session["index"]]
    session["answers"][key] = data.answer.strip()
    session["index"] += 1

    if session["index"] >= len(qs):
        results = build_skill_results(session["role_id"], session["answers"])
        session["results"] = results
        session["done"] = True
        biggest = max(results, key=lambda x: x["gap"])
        return {
            "session_id": data.session_id,
            "message": f"That's enough to calibrate your profile. Your biggest current lever is {biggest['name']}. I've prepared your personalized skill-gap analysis.",
            "quick_replies": [],
            "done": True,
            "redirect_to": "/skill-gap",
        }

    question, options = question_for(session)
    previous = data.answer.strip()
    acknowledgement = "Got it — that gives me a useful signal."
    if level_from_answer(previous) >= 70:
        acknowledgement = "Strong signal — that suggests solid hands-on depth."
    elif level_from_answer(previous) <= 40:
        acknowledgement = "Thanks — I'll treat that as an area where more depth may be useful."
    return {
        "session_id": data.session_id,
        "message": f"{acknowledgement} Next: {question}",
        "quick_replies": options,
        "done": False,
    }


def get_session_results(session_id: str) -> dict[str, Any]:
    session = sessions.get(session_id)
    if not session or not session.get("done"):
        raise HTTPException(status_code=404, detail="Complete the guided chat before viewing results.")
    results = session["results"]
    at_target = sum(1 for s in results if s["your_level_pct"] >= s["role_target_pct"])
    need_depth = sum(1 for s in results if s["depth_call"] == "MASTER" and s["gap"] > 0)
    past_target = sum(1 for s in results if s["your_level_pct"] > s["role_target_pct"])
    score = round(sum(min(s["your_level_pct"] / max(s["role_target_pct"], 1), 1) for s in results) / len(results) * 100)
    biggest = max(results, key=lambda x: x["gap"])
    return {
        "role": ROLE_CONFIG[session["role_id"]]["title"],
        "role_id": session["role_id"],
        "futureproof_score": score,
        "summary": {"at_or_above_target": at_target, "need_real_depth": need_depth, "already_past_target": past_target},
        "skills": results,
        "biggest_lever": biggest["name"],
        "answers": session["answers"],
    }


@app.get("/skill-gap/{session_id}")
def skill_gap(session_id: str):
    return get_session_results(session_id)


@app.get("/roadmap/{session_id}")
def roadmap(session_id: str):
    result = get_session_results(session_id)
    groups = {"MASTER": [], "AI-AUGMENT": [], "BASIC-AWARENESS": []}
    for skill in result["skills"]:
        gap = skill["gap"]
        hours = max(1, round(gap * ({"MASTER": 0.08, "AI-AUGMENT": 0.05, "BASIC-AWARENESS": 0.03}[skill["depth_call"]])))
        groups[skill["depth_call"]].append({
            "name": skill["name"],
            "depth": skill["depth_call"],
            "tier": skill["tier"],
            "hours_per_week": hours,
            "resource": {
                "MASTER": "Concepts + project practice",
                "AI-AUGMENT": "AI-assisted project drills",
                "BASIC-AWARENESS": "Short overview + verification practice",
            }[skill["depth_call"]],
            "status": "Ready" if gap == 0 else "Not Started",
        })
    phases = [
        {"phase_number": 1, "title": "Master the Core", "days": "1-30", "skills": sorted(groups["MASTER"], key=lambda x: -x["hours_per_week"])},
        {"phase_number": 2, "title": "Augment with AI", "days": "31-60", "skills": sorted(groups["AI-AUGMENT"], key=lambda x: -x["hours_per_week"])},
        {"phase_number": 3, "title": "Awareness & Ship", "days": "61-90", "skills": sorted(groups["BASIC-AWARENESS"], key=lambda x: -x["hours_per_week"])},
    ]
    total_hours = sum(s["hours_per_week"] * 4 for p in phases for s in p["skills"])
    return {
        "role": result["role"],
        "total_hours": total_hours,
        "master_count": len(groups["MASTER"]),
        "augment_count": len(groups["AI-AUGMENT"]),
        "awareness_count": len(groups["BASIC-AWARENESS"]),
        "phases": phases,
    }
