from __future__ import annotations

import base64
import difflib
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ============================================================
# GEMINI SERVICE
# ============================================================

from app.services.gemini_service import (
    evaluate_answer,
    generate_next_question,
    generate_assessment_summary,
    generate_supportive_acknowledgement,
    gemini_status,
)

from app.services.assessment_service import (
    build_conversation,
    apply_gemini_evaluations,
    build_score_explanation,
)

# ============================================================
# LEGACY OPENAI SUPPORT
# ============================================================

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


# ============================================================
# PATHS / CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = BASE_DIR / "data" / "dataset.json"

DB_PATH = Path(
    os.getenv(
        "SKILLPILOT_DB_PATH",
        str(BASE_DIR / "skillpilot.db"),
    )
)

AUTH_SECRET = os.getenv(
    "SKILLPILOT_AUTH_SECRET",
    "skillpilot-local-demo-secret-change-me",
)

LLM_MODEL = os.getenv(
    "LLM_MODEL",
    "gpt-5.6-luna",
)


# ============================================================
# DATASET
# ============================================================

with DATASET_PATH.open("r", encoding="utf-8") as f:
    DATASET = json.load(f)

RAW_ROLES: list[dict[str, Any]] = DATASET.get("roles", [])


# ============================================================
# ROLE CONFIGURATION
# ============================================================

ROLE_CONFIG: dict[str, dict[str, Any]] = {
    "data-scientist": {
        "title": "Data Scientist",
        "impact": "Balanced impact",
        "description": (
            "AI accelerates routine analysis, while problem framing, "
            "statistical judgment and communication remain high-value "
            "human work."
        ),
        "skills": [
            (
                "Critical Thinking",
                "Human-Core",
                "MASTER",
                "Challenge assumptions, choose methods and interpret uncertainty.",
            ),
            (
                "Mathematics & Statistics",
                "Human-Core",
                "MASTER",
                "Build strong statistical reasoning for trustworthy decisions.",
            ),
            (
                "Experiment Design",
                "Human-Core",
                "MASTER",
                "Frame useful questions and design valid experiments.",
            ),
            (
                "Python & Programming",
                "AI-Augmented",
                "AI-AUGMENT",
                "Use AI for implementation speed while retaining code and debugging judgment.",
            ),
            (
                "SQL & Data Modeling",
                "AI-Augmented",
                "AI-AUGMENT",
                "Let AI draft queries, but validate logic, joins and data quality.",
            ),
            (
                "Data Visualization",
                "AI-Augmented",
                "AI-AUGMENT",
                "Use AI to explore charts while owning the evidence and narrative.",
            ),
            (
                "Machine Learning",
                "AI-Augmented",
                "AI-AUGMENT",
                "Understand model behavior and validation deeply enough to supervise AI.",
            ),
            (
                "Routine Reporting",
                "AI-Accelerated",
                "BASIC-AWARENESS",
                "Understand automated reporting pipelines and verify outputs.",
            ),
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
        "description": (
            "Code generation is accelerating implementation, making "
            "architecture, debugging, testing and system-level judgment "
            "more important."
        ),
        "skills": [
            (
                "Complex Problem Solving",
                "Human-Core",
                "MASTER",
                "Break ambiguous requirements into reliable technical decisions.",
            ),
            (
                "Systems Analysis & Design",
                "Human-Core",
                "MASTER",
                "Own architecture, constraints, trade-offs and failure modes.",
            ),
            (
                "Code Review & Quality",
                "Human-Core",
                "MASTER",
                "Judge generated code for security, correctness, maintainability and performance.",
            ),
            (
                "Programming",
                "AI-Augmented",
                "AI-AUGMENT",
                "Pair with AI for implementation while owning structure, correctness and debugging.",
            ),
            (
                "Testing",
                "AI-Augmented",
                "AI-AUGMENT",
                "Use AI to generate tests, then decide what actually matters.",
            ),
            (
                "DevOps & Cloud",
                "AI-Augmented",
                "AI-AUGMENT",
                "Automate infrastructure while understanding deployment and recovery.",
            ),
            (
                "Documentation",
                "AI-Accelerated",
                "BASIC-AWARENESS",
                "Review AI-drafted documentation and maintain the important parts.",
            ),
            (
                "Boilerplate Implementation",
                "AI-Accelerated",
                "BASIC-AWARENESS",
                "Understand generated scaffolding well enough to inspect and modify it.",
            ),
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
        "description": (
            "AI can generate interface variations quickly, but user "
            "understanding, product judgment and interaction decisions "
            "remain critical."
        ),
        "skills": [
            (
                "User Research",
                "Human-Core",
                "MASTER",
                "Understand real users, contexts and pain points.",
            ),
            (
                "Product & Design Judgment",
                "Human-Core",
                "MASTER",
                "Own prioritization, taste and product trade-offs.",
            ),
            (
                "Interaction Design",
                "Human-Core",
                "MASTER",
                "Design coherent behavior across contexts.",
            ),
            (
                "Design Systems",
                "AI-Augmented",
                "AI-AUGMENT",
                "Use AI to speed component work while owning consistency.",
            ),
            (
                "Prototyping",
                "AI-Augmented",
                "AI-AUGMENT",
                "Explore variants quickly, then validate the right interaction.",
            ),
            (
                "Visual Design",
                "AI-Augmented",
                "AI-AUGMENT",
                "Curate AI-generated directions against the product context.",
            ),
            (
                "Figma & Production Tools",
                "AI-Accelerated",
                "BASIC-AWARENESS",
                "Know the tools while focusing on design decisions.",
            ),
            (
                "Asset & Screen Generation",
                "AI-Accelerated",
                "BASIC-AWARENESS",
                "Use generated first passes without outsourcing design judgment.",
            ),
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
    "uiux-designer": "ui-ux-designer",
    "ux-designer": "ui-ux-designer",
    "web-and-digital-interface-designer": "ui-ux-designer",
}


# ============================================================
# QUESTION TEMPLATES
# ============================================================

QUESTION_TEMPLATES = {
    "data-scientist": [
        (
            "statistics",
            "When a dataset gives you a surprising result, what would you actually do before trusting it?",
            [
                "Check assumptions, uncertainty and data quality",
                "I can do the checks with some guidance",
                "I would mostly follow the model/output",
            ],
        ),
        (
            "python",
            "Tell me about the most substantial Python work you have personally built.",
            [
                "A project I can build and debug independently",
                "Small projects/notebooks with some guidance",
                "Mostly coursework or tutorials",
            ],
        ),
        (
            "sql",
            "If a query returns the wrong number of customers, how would you investigate it?",
            [
                "Trace joins, filters, duplicates and source data",
                "I know the basics but need practice",
                "I would need someone to guide me",
            ],
        ),
        (
            "ml",
            "How would you decide whether an ML model is actually good enough to use?",
            [
                "Choose metrics, validate properly and inspect failure cases",
                "I can evaluate models using standard metrics",
                "I mainly know the concepts from coursework",
            ],
        ),
        (
            "project",
            "Which best describes how you use AI while learning or building?",
            [
                "I use it as a copilot and verify its work",
                "I use it for explanations and first drafts",
                "I tend to copy working outputs first",
            ],
        ),
        (
            "evidence",
            "What can you show today that proves your strongest skill?",
            [
                "A project/result I can explain end-to-end",
                "A few guided projects or assignments",
                "Mostly certificates/coursework",
            ],
        ),
    ],
    "software-developer": [
        (
            "programming",
            "When an AI-generated feature works but feels fragile, what do you check?",
            [
                "Architecture, edge cases, tests and maintainability",
                "I can review it with a checklist",
                "I mostly focus on whether it runs",
            ],
        ),
        (
            "systems",
            "Given a feature with scale and reliability constraints, how would you approach the design?",
            [
                "I can compare trade-offs and design the system",
                "I understand common patterns",
                "I need guidance on architecture",
            ],
        ),
        (
            "testing",
            "A bug appears only in production. What is your first debugging move?",
            [
                "Reproduce, inspect evidence, isolate and add a regression test",
                "I can debug with logs and guidance",
                "I usually search for a similar fix",
            ],
        ),
        (
            "devops",
            "How much have you actually deployed and operated yourself?",
            [
                "I have deployed and monitored projects",
                "I have deployed a few projects",
                "I have mainly studied deployment concepts",
            ],
        ),
        (
            "project",
            "How do you use coding AI without losing ownership of the code?",
            [
                "Generate small pieces, review, test and refactor",
                "Use it for drafts and explanations",
                "Mostly accept generated code when it works",
            ],
        ),
        (
            "evidence",
            "What is your strongest proof of engineering depth?",
            [
                "A deployed project I can defend end-to-end",
                "Several student/personal projects",
                "Mostly coursework/tutorials",
            ],
        ),
    ],
    "ui-ux-designer": [
        (
            "research",
            "How would you learn whether a design actually solves a user's problem?",
            [
                "Interview/test users and synthesize patterns",
                "I can run basic tests with guidance",
                "I mostly judge the screen myself",
            ],
        ),
        (
            "interaction",
            "A flow looks clean but users keep dropping off. What would you inspect?",
            [
                "User behavior, friction, hierarchy and alternatives",
                "I can inspect common UX issues",
                "I would need a framework/checklist",
            ],
        ),
        (
            "visual",
            "How do you decide whether a visual design is good rather than just attractive?",
            [
                "It serves hierarchy, context and the product goal",
                "I know basic visual principles",
                "I mostly judge by appearance",
            ],
        ),
        (
            "tools",
            "How independently can you turn a product idea into a usable Figma prototype?",
            [
                "I can build and iterate independently",
                "I can create prototypes with some guidance",
                "I am still learning the workflow",
            ],
        ),
        (
            "project",
            "How do you use AI in design work without outsourcing design judgment?",
            [
                "Generate options, critique them and validate with users",
                "Use it for ideation and first passes",
                "Mostly use generated screens as the starting point",
            ],
        ),
        (
            "evidence",
            "What is your strongest proof of design depth?",
            [
                "A case study with research, iterations and outcomes",
                "A portfolio of guided projects",
                "Mostly coursework/templates",
            ],
        ),
    ],
}


# ============================================================
# RESOURCES
# ============================================================

RESOURCE_MAP = {
    "Python & Programming": (
        "Python tutorial",
        "https://docs.python.org/3/tutorial/",
    ),
    "SQL & Data Modeling": (
        "SQLBolt",
        "https://sqlbolt.com/",
    ),
    "Machine Learning": (
        "scikit-learn user guide",
        "https://scikit-learn.org/stable/user_guide.html",
    ),
    "Data Visualization": (
        "Matplotlib tutorials",
        "https://matplotlib.org/stable/tutorials/",
    ),
    "Mathematics & Statistics": (
        "Khan Academy statistics",
        "https://www.khanacademy.org/math/statistics-probability",
    ),
    "Programming": (
        "MDN JavaScript Guide",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    ),
    "Testing": (
        "pytest documentation",
        "https://docs.pytest.org/en/stable/",
    ),
    "DevOps & Cloud": (
        "AWS Skill Builder",
        "https://skillbuilder.aws/",
    ),
    "Figma & Production Tools": (
        "Figma Learn",
        "https://help.figma.com/hc/en-us/categories/360002042553",
    ),
    "Visual Design": (
        "Material Design",
        "https://m3.material.io/",
    ),
}

DEFAULT_RESOURCE = (
    "Skill practice + project",
    "https://developer.mozilla.org/",
)


# ============================================================
# UTILITIES
# ============================================================

def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def get_role(role_id: str) -> dict[str, Any]:
    role_id = ROLE_ALIASES.get(role_id, role_id)

    if role_id not in ROLE_CONFIG:
        raise HTTPException(404, "Role not found")

    return ROLE_CONFIG[role_id]


def get_raw_role(role_id: str) -> dict[str, Any]:
    cfg = get_role(role_id)

    for role in RAW_ROLES:
        raw_title = role.get("role_name", "")

        if (
            raw_title == cfg["title"]
            or slugify(raw_title) == role_id
            or cfg["title"] in raw_title
            or raw_title in cfg["title"]
        ):
            return role

    raise HTTPException(404, "Dataset entry not found")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# DATABASE
# ============================================================

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


# ============================================================
# AUTH
# ============================================================

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        180_000,
    )

    return (
        "pbkdf2_sha256$180000$"
        f"{base64.urlsafe_b64encode(salt).decode()}$"
        f"{base64.urlsafe_b64encode(digest).decode()}"
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        _, rounds, salt_b64, digest_b64 = stored.split("$")

        salt = base64.urlsafe_b64decode(
            salt_b64.encode()
        )

        expected = base64.urlsafe_b64decode(
            digest_b64.encode()
        )

        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt,
            int(rounds),
        )

        return hmac.compare_digest(actual, expected)

    except Exception:
        return False


def make_token(user_id: str) -> str:
    payload = (
        f"{user_id}."
        f"{int(datetime.now(timezone.utc).timestamp())}"
    )

    sig = hmac.new(
        AUTH_SECRET.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()

    return base64.urlsafe_b64encode(
        f"{payload}.{sig}".encode()
    ).decode()


def token_user(token: str) -> str | None:
    try:
        raw = base64.urlsafe_b64decode(
            token.encode()
        ).decode()

        user_id, issued, sig = raw.split(".")

        payload = f"{user_id}.{issued}"

        expected = hmac.new(
            AUTH_SECRET.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(sig, expected):
            return None

        return user_id

    except Exception:
        return None


def current_user(
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:

    if (
        not authorization
        or not authorization.lower().startswith("bearer ")
    ):
        raise HTTPException(
            401,
            "Please log in to continue.",
        )

    uid = token_user(
        authorization.split(" ", 1)[1].strip()
    )

    if not uid:
        raise HTTPException(
            401,
            "Your login session is invalid. Please log in again.",
        )

    conn = db()

    row = conn.execute(
        "SELECT * FROM users WHERE id=?",
        (uid,),
    ).fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            401,
            "User account not found.",
        )

    return dict(row)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_db():
    conn = db()

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            target_role TEXT,
            weekly_hours REAL DEFAULT 8,
            learning_goal TEXT DEFAULT 'Job Ready',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS analyses (
            session_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'in_progress',
            answers_json TEXT NOT NULL DEFAULT '{}',
            results_json TEXT NOT NULL DEFAULT '{}',
            roadmap_json TEXT NOT NULL DEFAULT '{}',
            gemini_evaluations_json TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(session_id)
                REFERENCES analyses(session_id)
                ON DELETE CASCADE,
            FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS roadmaps (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            assessment_id TEXT NOT NULL,
            version INTEGER NOT NULL,
            duration_months INTEGER NOT NULL,
            goal TEXT NOT NULL,
            weekly_hours REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            data_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,
            FOREIGN KEY(assessment_id)
                REFERENCES analyses(session_id)
                ON DELETE CASCADE
        )
        """
    )

    # --------------------------------------------------------
    # Lightweight migrations
    # --------------------------------------------------------

    analysis_cols = {
        r[1]
        for r in conn.execute(
            "PRAGMA table_info(analyses)"
        ).fetchall()
    }

    if "results_json" not in analysis_cols:
        conn.execute(
            """
            ALTER TABLE analyses
            ADD COLUMN results_json TEXT NOT NULL DEFAULT '{}'
            """
        )

    message_cols = {
        r[1]
        for r in conn.execute(
            "PRAGMA table_info(chat_messages)"
        ).fetchall()
    }

    if "user_id" not in message_cols:
        conn.execute(
            """
            ALTER TABLE chat_messages
            ADD COLUMN user_id TEXT
            """
        )

        conn.execute(
            """
            UPDATE chat_messages
            SET user_id=(
                SELECT user_id
                FROM analyses
                WHERE analyses.session_id=chat_messages.session_id
            )
            WHERE user_id IS NULL
            """
        )

    conn.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
        ON users(email)
        """
    )

    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_analyses_user
        ON analyses(user_id, updated_at)
        """
    )

    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_messages_session
        ON chat_messages(session_id, created_at)
        """
    )

    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_roadmaps_user
        ON roadmaps(user_id, updated_at)
        """
    )

    conn.commit()
    conn.close()


def ensure_analysis_columns():
    return None


# ============================================================
# ANALYSIS / CHAT HELPERS
# ============================================================

def load_analysis(
    session_id: str,
    user_id: str | None = None,
):
    conn = db()

    if user_id:
        row = conn.execute(
            """
            SELECT *
            FROM analyses
            WHERE session_id=? AND user_id=?
            """,
            (session_id, user_id),
        ).fetchone()
    else:
        row = conn.execute(
            """
            SELECT *
            FROM analyses
            WHERE session_id=?
            """,
            (session_id,),
        ).fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            404,
            "Analysis session not found.",
        )

    return dict(row)


def save_message(
    session_id: str,
    user_id: str,
    sender: str,
    message: str,
):
    conn = db()

    conn.execute(
        """
        INSERT INTO chat_messages(
            session_id,
            user_id,
            sender,
            message,
            created_at
        )
        VALUES(?,?,?,?,?)
        """,
        (
            session_id,
            user_id,
            sender,
            message,
            now(),
        ),
    )

    conn.commit()
    conn.close()


def get_messages(
    session_id: str,
    user_id: str,
):
    conn = db()

    rows = conn.execute(
        """
        SELECT id, sender, message, created_at
        FROM chat_messages
        WHERE session_id=? AND user_id=?
        ORDER BY id
        """,
        (session_id, user_id),
    ).fetchall()

    conn.close()

    return [dict(r) for r in rows]


# ============================================================
# LEGACY OPENAI HELPERS
# ============================================================

# ============================================================
# GEMINI ASSESSMENT HELPERS
# ============================================================

def role_skill_payloads(role_id: str) -> list[dict[str, Any]]:
    return [
        {"name": n, "tier": t, "depth": d, "note": note}
        for n, t, d, note in get_role(role_id)["skills"]
    ]


def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def match_evaluation_skill(evaluation_skill: str, role_skills: list[dict[str, Any]]) -> dict[str, Any] | None:
    target = normalize_text(evaluation_skill)
    if not target:
        return None
    best = None
    best_score = 0.0
    target_tokens = set(target.split())
    for skill in role_skills:
        name = normalize_text(skill["name"])
        name_tokens = set(name.split())
        overlap = len(target_tokens & name_tokens) / max(len(name_tokens), 1)
        similarity = difflib.SequenceMatcher(None, target, name).ratio()
        score = 0.65 * overlap + 0.35 * similarity
        if target == name:
            return skill
        if score > best_score:
            best_score = score
            best = skill
    return best if best_score >= 0.25 else None


def build_skill_results_from_gemini(role_id: str, evaluations: list[dict[str, Any]]) -> list[dict[str, Any]]:
    role_skills = role_skill_payloads(role_id)
    buckets = {s["name"]: [] for s in role_skills}
    for evaluation in evaluations:
        matched = match_evaluation_skill(str(evaluation.get("skill", "")), role_skills)
        if matched:
            buckets[matched["name"]].append(evaluation)

    targets = {"MASTER": 85, "AI-AUGMENT": 75, "BASIC-AWARENESS": 45}
    results = []

    for skill in role_skills:
        name = skill["name"]
        depth = skill["depth"]
        matched = buckets[name]

        if matched:
            current = round(sum(max(0, min(100, int(e.get("current_level", 45)))) for e in matched) / len(matched))
            confidence = round(sum(max(0.0, min(1.0, float(e.get("confidence", 0.5)))) for e in matched) / len(matched), 2)
            evidence, strengths, gaps = [], [], []
            for e in matched:
                for item in e.get("evidence", []) or []:
                    if item and item not in evidence:
                        evidence.append(str(item))
                for item in e.get("strengths", []) or []:
                    if item and item not in strengths:
                        strengths.append(str(item))
                for item in e.get("gaps", []) or []:
                    if item and item not in gaps:
                        gaps.append(str(item))
            evidence, strengths, gaps = evidence[:4], strengths[:4], gaps[:4]
        else:
            current = 35 if depth == "MASTER" else 40 if depth == "AI-AUGMENT" else 35
            confidence = 0.30
            evidence = []
            strengths = []
            gaps = ["Not enough direct evidence was collected during the assessment."]

        target = targets[depth]
        results.append({
            "name": name,
            "tier": skill["tier"],
            "depth_call": depth,
            "your_level_pct": current,
            "role_target_pct": target,
            "gap": max(target - current, 0),
            "note": skill["note"],
            "confidence": confidence,
            "evidence": evidence,
            "strengths": strengths,
            "gaps": gaps,
            "why_depth": skill["note"],
        })
    return results


def fallback_final_summary(results: list[dict[str, Any]]) -> dict[str, Any]:
    if not results:
        return {"overall_summary": "Not enough evidence was collected.", "strongest_area": None, "biggest_gap": None, "recommended_focus": [], "ai_collaboration_level": 50, "human_judgment_level": 50, "adaptability_level": 50, "confidence": 0.3}
    strongest = max(results, key=lambda x: x["your_level_pct"])
    biggest = max(results, key=lambda x: x["gap"])
    human = [r["your_level_pct"] for r in results if r["depth_call"] == "MASTER"]
    augment = [r["your_level_pct"] for r in results if r["depth_call"] == "AI-AUGMENT"]
    return {
        "overall_summary": f"Your strongest demonstrated area is {strongest['name']}, while {biggest['name']} is the highest-priority development gap.",
        "strongest_area": strongest["name"],
        "biggest_gap": biggest["name"],
        "recommended_focus": [r["name"] for r in sorted(results, key=lambda x: -x["gap"])[:3]],
        "ai_collaboration_level": round(sum(augment) / len(augment)) if augment else 50,
        "human_judgment_level": round(sum(human) / len(human)) if human else 50,
        "adaptability_level": round(sum(r["your_level_pct"] for r in results) / len(results)),
        "confidence": round(sum(r["confidence"] for r in results) / len(results), 2),
    }


def fallback_next_question(role_id: str, answer_index: int) -> dict[str, Any]:
    q = QUESTION_TEMPLATES[role_id][min(answer_index, len(QUESTION_TEMPLATES[role_id]) - 1)]
    return {"next_question": q[1], "target_skill": q[0], "difficulty": "intermediate", "reason": "Fallback question used because adaptive generation was unavailable.", "quick_replies": q[2]}


def llm_available() -> bool:
    return (
        bool(os.getenv("OPENAI_API_KEY"))
        and OpenAI is not None
    )


def llm_json(
    prompt: str,
) -> dict[str, Any] | None:

    if not llm_available():
        return None

    try:
        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )

        response = client.responses.create(
            model=LLM_MODEL,
            input=prompt,
        )

        text = response.output_text.strip()

        text = re.sub(
            r"^```(?:json)?\s*|\s*```$",
            "",
            text,
        ).strip()

        return json.loads(text)

    except Exception:
        return None


# ============================================================
# FALLBACK SCORING
# ============================================================

def level_from_answer(answer: str) -> int:
    a = answer.lower()

    if any(
        x in a
        for x in [
            "independently",
            "end-to-end",
            "confidently",
            "deeply",
            "reproduce",
            "validate",
            "trade-offs",
            "research/test users",
        ]
    ):
        return 82

    if any(
        x in a
        for x in [
            "project",
            "projects",
            "regularly",
            "some guidance",
            "basic",
            "standard",
            "drafts",
            "ideation",
        ]
    ):
        return 58

    if any(
        x in a
        for x in [
            "coursework",
            "tutorial",
            "need guidance",
            "mostly",
            "still learning",
            "copy",
            "templates",
        ]
    ):
        return 32

    return 45


# ============================================================
# SKILL RESULTS
# ============================================================

def build_skill_results(role_id: str, answers: dict[str, str]) -> list[dict[str, Any]]:
    fake_evaluations = [
        {
            "skill": QUESTION_TEMPLATES[role_id][i][0],
            "current_level": level_from_answer(answer),
            "confidence": 0.35,
            "evidence": [answer[:240]],
            "strengths": [],
            "gaps": [],
        }
        for i, answer in enumerate(answers.values())
        if i < len(QUESTION_TEMPLATES[role_id])
    ]
    return build_skill_results_from_gemini(role_id, fake_evaluations)


# ============================================================
# AI RESILIENCE SCORE
# ============================================================

def resilience_score(results):

    buckets = {}

    for depth in [
        "MASTER",
        "AI-AUGMENT",
    ]:

        vals = [
            min(
                s["your_level_pct"]
                / max(
                    s["role_target_pct"],
                    1,
                ),
                1,
            )
            for s in results
            if s["depth_call"] == depth
        ]

        buckets[depth] = (
            sum(vals) / len(vals)
            if vals
            else 0
        )

    covered = sum(
        1
        for s in results
        if s["your_level_pct"]
        >= min(
            55,
            s["role_target_pct"] * 0.65,
        )
    )

    breadth = covered / max(
        len(results),
        1,
    )

    score = round(
        100
        * (
            0.55 * buckets["MASTER"]
            + 0.30 * buckets["AI-AUGMENT"]
            + 0.15 * breadth
        )
    )

    return (
        max(0, min(100, score)),
        {
            "human_core": round(
                buckets["MASTER"] * 100
            ),
            "ai_supervision": round(
                buckets["AI-AUGMENT"] * 100
            ),
            "skill_coverage": round(
                breadth * 100
            ),
            "skill_coverage_label": (
                f"{covered}/{len(results)} "
                "core skill areas covered"
            ),
        },
    )


# ============================================================
# ROADMAP TASKS
# ============================================================

def make_task(
    skill,
    depth,
    index,
    resource,
):

    templates = {
        "MASTER": [
            "Learn the core concepts",
            "Complete 2 deliberate practice exercises",
            "Ship one mini-project and explain your decisions",
        ],
        "AI-AUGMENT": [
            "Learn the workflow and failure modes",
            "Complete an AI-assisted drill with verification",
            "Ship one small project with tests/review",
        ],
        "BASIC-AWARENESS": [
            "Complete a short overview",
            "Try one guided exercise",
            "Write a one-page verification checklist",
        ],
    }

    return {
        "id": f"{slugify(skill)}-{index + 1}",
        "title": templates[depth][index],
        "done": False,
        "resource": resource[0],
        "resource_url": resource[1],
    }


# ============================================================
# ROADMAP BUILDER
# ============================================================

def build_roadmap(
    result,
    duration_months=3,
    goal="Job Ready",
    weekly_hours=8,
    customization=None,
    previous=None,
):

    duration_months = max(
        1,
        min(24, int(duration_months)),
    )

    weekly_hours = max(
        1,
        min(40, float(weekly_hours)),
    )

    groups = {
        "MASTER": [],
        "AI-AUGMENT": [],
        "BASIC-AWARENESS": [],
    }

    for skill in result["skills"]:

        depth = skill["depth_call"]

        resource = RESOURCE_MAP.get(
            skill["name"],
            DEFAULT_RESOURCE,
        )

        gap = skill["gap"]

        base = max(
            1,
            round(
                gap
                * {
                    "MASTER": 0.08,
                    "AI-AUGMENT": 0.05,
                    "BASIC-AWARENESS": 0.03,
                }[depth]
            ),
        )

        groups[depth].append(
            {
                "name": skill["name"],
                "depth": depth,
                "tier": skill["tier"],
                "hours_per_week": base,
                "resource": resource[0],
                "resource_url": resource[1],
                "tasks": [
                    make_task(
                        skill["name"],
                        depth,
                        i,
                        resource,
                    )
                    for i in range(3)
                ],
            }
        )

    if customization:

        multiplier = max(
            0.5,
            min(
                2.0,
                float(
                    customization.get(
                        "pace_multiplier",
                        1,
                    )
                ),
            ),
        )

        paused = set(
            customization.get(
                "paused_skills",
                [],
            )
        )

        for items in groups.values():

            for s in items:

                s["paused"] = (
                    s["name"] in paused
                )

                s["hours_per_week"] = (
                    0
                    if s["paused"]
                    else max(
                        1,
                        round(
                            s["hours_per_week"]
                            * multiplier
                        ),
                    )
                )

    total_days = duration_months * 30

    chunks = [
        max(
            1,
            round(total_days * 0.35),
        ),
        max(
            1,
            round(total_days * 0.40),
        ),
    ]

    chunks.append(
        max(
            1,
            total_days - sum(chunks),
        )
    )

    phase_names = [
        "Master the Core",
        "Build & Augment with AI",
        "Ship & Demonstrate",
    ]

    phases = []

    for i, (name, days) in enumerate(
        zip(
            phase_names,
            chunks,
        ),
        1,
    ):

        group_key = [
            "MASTER",
            "AI-AUGMENT",
            "BASIC-AWARENESS",
        ][i - 1]

        phases.append(
            {
                "phase_number": i,
                "title": name,
                "days": (
                    f"{1 if i == 1 else sum(chunks[: i - 1]) + 1}"
                    f"-{sum(chunks[:i])}"
                ),
                "skills": sorted(
                    groups[group_key],
                    key=lambda x: -x[
                        "hours_per_week"
                    ],
                ),
            }
        )

    total_hours = sum(
        s["hours_per_week"] * 4
        for p in phases
        for s in p["skills"]
    )

    return {
        "role": result["role"],
        "role_id": result["role_id"],
        "duration_months": duration_months,
        "goal": goal,
        "weekly_hours": weekly_hours,
        "total_hours": total_hours,
        "master_count": len(
            groups["MASTER"]
        ),
        "augment_count": len(
            groups["AI-AUGMENT"]
        ),
        "awareness_count": len(
            groups["BASIC-AWARENESS"]
        ),
        "phases": phases,
        "flow": (
            "goal -> foundation -> applied skills -> "
            "portfolio/interview proof -> target outcome"
        ),
    }


# ============================================================
# ROLE PAYLOAD
# ============================================================

def role_payload(role_id):

    cfg = get_role(role_id)
    raw = get_raw_role(role_id)

    return {
        "id": role_id,
        "title": cfg["title"],
        "impact_tag": cfg["impact"],
        "description": cfg["description"],
        "onet_soc_code": raw.get(
            "onet_soc_code"
        ),
        "source": raw.get("source"),
        "responsibilities": cfg[
            "responsibilities"
        ],
        "skills": [
            {
                "name": n,
                "tier": t,
                "depth": d,
                "note": note,
            }
            for n, t, d, note in cfg[
                "skills"
            ]
        ],
        "onet_evidence": {
            "tasks": raw.get(
                "tasks",
                [],
            )[:6],
            "essential_skills": raw.get(
                "essential_skills",
                [],
            )[:6],
            "software_skills": raw.get(
                "software_skills",
                [],
            )[:8],
        },
    }


# ============================================================
# REQUEST MODELS
# ============================================================

class Signup(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=80,
    )
    email: str
    password: str = Field(
        min_length=6,
        max_length=128,
    )


class Login(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=80,
    )
    target_role: str | None = None
    weekly_hours: float = Field(
        default=8,
        ge=1,
        le=40,
    )
    learning_goal: str = Field(
        default="Job Ready",
        max_length=80,
    )


class ChatStart(BaseModel):
    role_id: str
    user_id: str | None = None


class ChatReply(BaseModel):
    session_id: str
    answer: str = Field(
        min_length=1,
        max_length=2000,
    )


class ProgressUpdate(BaseModel):
    task_id: str
    done: bool


class RoadmapCreate(BaseModel):
    duration_months: int = Field(
        default=3,
        ge=1,
        le=24,
    )
    goal: str = Field(
        default="Job Ready",
        max_length=80,
    )
    weekly_hours: float = Field(
        default=8,
        ge=1,
        le=40,
    )


class RoadmapAdapt(BaseModel):
    reason: str = Field(
        min_length=3,
        max_length=100,
    )
    details: str = Field(
        default="",
        max_length=1000,
    )
    duration_months: int | None = Field(
        default=None,
        ge=1,
        le=24,
    )
    weekly_hours: float | None = Field(
        default=None,
        ge=1,
        le=40,
    )
    goal: str | None = None


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="SkillPilot API",
    version="3.0.0",
)

origins = [
    x.strip()
    for x in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if x.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
ensure_analysis_columns()


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def home():
    return {
        "message": "SkillPilot API is running",
        "status": "success",
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
        "roles": len(ROLE_CONFIG),
        "database": "sqlite",
        "db_path": str(DB_PATH),
        "openai_enabled": llm_available(),
        "gemini": gemini_status(),
    }


# ============================================================
# AUTH
# ============================================================

@app.post("/auth/signup")
def signup(data: Signup):

    email = data.email.strip().lower()

    conn = db()

    existing = conn.execute(
        "SELECT id FROM users WHERE email=?",
        (email,),
    ).fetchone()

    if existing:
        conn.close()

        raise HTTPException(
            409,
            "An account with this email already exists. Please log in.",
        )

    uid = uuid.uuid4().hex
    stamp = now()

    conn.execute(
        """
        INSERT INTO users(
            id,
            name,
            email,
            password_hash,
            created_at,
            updated_at
        )
        VALUES(?,?,?,?,?,?)
        """,
        (
            uid,
            data.name.strip(),
            email,
            hash_password(data.password),
            stamp,
            stamp,
        ),
    )

    conn.commit()
    conn.close()

    return {
        "created": True,
        "message": "Account created successfully. Please log in.",
        "email": email,
    }


@app.post("/auth/login")
def login(data: Login):

    email = data.email.strip().lower()

    conn = db()

    row = conn.execute(
        "SELECT * FROM users WHERE email=?",
        (email,),
    ).fetchone()

    conn.close()

    if not row or not verify_password(
        data.password,
        row["password_hash"],
    ):
        raise HTTPException(
            401,
            "Incorrect email or password.",
        )

    user = dict(row)

    return {
        "token": make_token(user["id"]),
        "user": {
            k: user[k]
            for k in [
                "id",
                "name",
                "email",
                "target_role",
                "weekly_hours",
                "learning_goal",
            ]
        },
    }


# ============================================================
# PROFILE
# ============================================================

@app.get("/me")
def me(
    user=Depends(current_user),
):
    return {
        k: user[k]
        for k in [
            "id",
            "name",
            "email",
            "target_role",
            "weekly_hours",
            "learning_goal",
        ]
    }


@app.put("/me/profile")
def update_profile(
    data: ProfileUpdate,
    user=Depends(current_user),
):

    target = (
        data.target_role
        if data.target_role in ROLE_CONFIG
        else None
    )

    conn = db()

    conn.execute(
        """
        UPDATE users
        SET
            name=?,
            target_role=?,
            weekly_hours=?,
            learning_goal=?,
            updated_at=?
        WHERE id=?
        """,
        (
            data.name.strip(),
            target,
            data.weekly_hours,
            data.learning_goal,
            now(),
            user["id"],
        ),
    )

    conn.commit()
    conn.close()

    return me(user)


# ============================================================
# ROLES
# ============================================================

@app.get("/roles")
def roles():

    return [
        {
            "id": rid,
            "title": cfg["title"],
            "impact_tag": cfg["impact"],
            "description": cfg["description"],
            "onet_soc_code": get_raw_role(
                rid
            ).get("onet_soc_code"),
        }
        for rid, cfg in ROLE_CONFIG.items()
    ]


@app.get("/roles/{role_id}")
def role_detail(role_id):

    return role_payload(role_id)


# ============================================================
# CHAT START
# ============================================================

@app.post("/chat/start")
def chat_start(data: ChatStart, user=Depends(current_user)):
    role_id = ROLE_ALIASES.get(data.role_id, data.role_id)
    get_role(role_id)
    sid = uuid.uuid4().hex

    conn = db()
    conn.execute(
        """INSERT INTO analyses(session_id,user_id,role_id,created_at,updated_at) VALUES(?,?,?,?,?)""",
        (sid, user["id"], role_id, now(), now()),
    )
    conn.commit()
    conn.close()

    q = QUESTION_TEMPLATES[role_id][0]
    msg = f"Let's calibrate your {get_role(role_id)['title']} depth. {q[1]}"
    save_message(sid, user["id"], "ai", msg)

    state = {
        "current_question": msg,
        "target_skill": q[0],
        "question_number": 1,
        "quick_replies": q[2],
        "evaluations": [],
    }
    conn = db()
    conn.execute("UPDATE analyses SET results_json=?, updated_at=? WHERE session_id=?", (json.dumps(state), now(), sid))
    conn.commit()
    conn.close()

    return {
        "session_id": sid,
        "role_id": role_id,
        "message": msg,
        "quick_replies": q[2],
        "question_number": 1,
        "total_questions": len(QUESTION_TEMPLATES[role_id]),
        "done": False,
        "messages": get_messages(sid, user["id"]),
    }


# ============================================================
# CHAT SESSIONS
# ============================================================

@app.get("/chat/sessions")
def chat_sessions(
    user=Depends(current_user),
):

    conn = db()

    rows = conn.execute(
        """
        SELECT
            session_id,
            role_id,
            status,
            created_at,
            updated_at
        FROM analyses
        WHERE user_id=?
        ORDER BY updated_at DESC
        """,
        (user["id"],),
    ).fetchall()

    conn.close()

    return [
        dict(r)
        for r in rows
    ]


@app.get("/chat/{session_id}")
def chat_history(session_id: str, user=Depends(current_user)):
    row = load_analysis(session_id, user["id"])
    state = json.loads(row["results_json"] or "{}")
    qs = QUESTION_TEMPLATES[row["role_id"]]
    answers = json.loads(row["answers_json"] or "{}")
    return {
        "session_id": session_id,
        "messages": get_messages(session_id, user["id"]),
        "done": row["status"] == "complete",
        "question_number": int(state.get("question_number", len(answers) + 1)),
        "total_questions": len(qs),
        "current_question": state.get("current_question"),
        "quick_replies": state.get("quick_replies", []),
    }


# ============================================================
# CHAT REPLY
# ============================================================

@app.post("/chat/reply")
def chat_reply(data: ChatReply, user=Depends(current_user)):
    row = load_analysis(data.session_id, user["id"])
    if row["status"] == "complete":
        raise HTTPException(400, "This analysis is already complete.")

    answers = json.loads(row["answers_json"] or "{}")
    state = json.loads(row["results_json"] or "{}")
    evaluations = state.get("evaluations", [])
    role_id = row["role_id"]
    role = get_role(role_id)
    qs = QUESTION_TEMPLATES[role_id]
    index = len(answers)

    if index >= len(qs):
        raise HTTPException(400, "This analysis is already complete.")

    answer = data.answer.strip()
    current_question = state.get("current_question") or qs[index][1]
    answers[qs[index][0]] = answer
    save_message(data.session_id, user["id"], "user", answer)

    messages = get_messages(data.session_id, user["id"])
    conversation = [
        {"role": "assistant" if m["sender"] == "ai" else "user", "content": m["message"]}
        for m in messages
    ]
    role_skills = role_skill_payloads(role_id)

    evaluation = evaluate_answer(
        role_title=role["title"],
        skills=role_skills,
        conversation=conversation,
        current_question=current_question,
        user_answer=answer,
    )

    if evaluation is None:
        evaluation = {
            "skill": qs[index][0],
            "current_level": level_from_answer(answer),
            "confidence": 0.35,
            "evidence": [answer[:240]],
            "strengths": [],
            "gaps": ["Adaptive AI evaluation was unavailable for this response."],
            "assessment": "Fallback score used so the assessment can continue.",
        }

    evaluations.append({
        "question_number": index + 1,
        "question": current_question,
        "answer": answer,
        **evaluation,
    })

    if len(answers) >= len(qs):
        results = build_skill_results_from_gemini(role_id, evaluations)
        score, breakdown = resilience_score(results)
        final_summary = generate_assessment_summary(
            role_title=role["title"],
            skills=role_skills,
            conversation=conversation,
        ) or fallback_final_summary(results)

        biggest = max(results, key=lambda x: x["gap"]) if results else None
        result = {
            "role": role["title"],
            "role_id": role_id,
            "ai_resilience_score": score,
            "score_breakdown": breakdown,
            "summary": {
                "at_or_above_target": sum(s["your_level_pct"] >= s["role_target_pct"] for s in results),
                "need_real_depth": sum(s["depth_call"] == "MASTER" and s["gap"] > 0 for s in results),
                "already_past_target": sum(s["your_level_pct"] > s["role_target_pct"] for s in results),
            },
            "biggest_lever": biggest["name"] if biggest else None,
            "skills": results,
            "answers": answers,
            "evaluations": evaluations,
            "gemini_summary": final_summary,
        }

        roadmap = build_roadmap(
            result,
            3,
            user.get("learning_goal") or "Job Ready",
            user.get("weekly_hours") or 8,
        )

        conn = db()
        conn.execute(
            """UPDATE analyses SET status='complete',answers_json=?,results_json=?,roadmap_json=?,updated_at=? WHERE session_id=?""",
            (json.dumps(answers), json.dumps(result), json.dumps(roadmap), now(), data.session_id),
        )
        conn.commit()
        conn.close()
        persist_roadmap(data.session_id, user["id"], roadmap)

        biggest_name = biggest["name"] if biggest else "your highest-priority skill gap"
        msg = f"Assessment complete. Your AI Resilience Score is {score}/100. Your biggest measured gap is {biggest_name}. Your Skill Gap and personalized roadmap are now ready."
        save_message(data.session_id, user["id"], "ai", msg)

        return {
            "session_id": data.session_id,
            "message": msg,
            "quick_replies": [],
            "done": True,
            "redirect_to": None,
            "ai_resilience_score": score,
            "biggest_lever": biggest_name,
        }

    next_data = generate_next_question(
        role_title=role["title"],
        skills=role_skills,
        conversation=conversation,
        latest_evaluation=evaluation,
    )

    if not next_data or not next_data.get("next_question"):
        next_data = fallback_next_question(role_id, index + 1)

    next_question = next_data["next_question"]
    target_skill = next_data.get("target_skill") or qs[index + 1][0]
    quick_replies = qs[index + 1][2] if next_question == qs[index + 1][1] else []

    ack = generate_supportive_acknowledgement(
        role_title=role["title"],
        user_answer=answer,
        evaluation=evaluation,
    )
    msg = f"{ack} Next: {next_question}"
    save_message(data.session_id, user["id"], "ai", msg)

    new_state = {
        "current_question": next_question,
        "target_skill": target_skill,
        "question_number": len(answers) + 1,
        "quick_replies": quick_replies,
        "evaluations": evaluations,
    }

    conn = db()
    conn.execute(
        """UPDATE analyses SET answers_json=?,results_json=?,updated_at=? WHERE session_id=?""",
        (json.dumps(answers), json.dumps(new_state), now(), data.session_id),
    )
    conn.commit()
    conn.close()

    return {
        "session_id": data.session_id,
        "message": msg,
        "quick_replies": quick_replies,
        "question_number": len(answers) + 1,
        "total_questions": len(qs),
        "done": False,
        "target_skill": target_skill,
        "difficulty": next_data.get("difficulty", "intermediate"),
    }


# ============================================================
# RESULTS
# ============================================================

def get_result(
    session_id,
    user_id,
):

    row = load_analysis(
        session_id,
        user_id,
    )

    if row["status"] != "complete":
        raise HTTPException(
            400,
            "Complete the guided chat before viewing results.",
        )

    saved = json.loads(
        row["results_json"] or "{}"
    )

    if isinstance(saved, list):

        results = saved

        score, breakdown = resilience_score(
            results
        )

        answers = json.loads(
            row["answers_json"]
        )

        role_id = row["role_id"]

    else:

        results = saved.get(
            "skills",
            [],
        )

        score = saved.get(
            "ai_resilience_score"
        )

        breakdown = saved.get(
            "score_breakdown",
            {},
        )

        answers = saved.get(
            "answers",
            {},
        )

        role_id = row["role_id"]

    return {
        "session_id": session_id,
        "role": get_role(
            role_id
        )["title"],
        "role_id": role_id,
        "ai_resilience_score": score,
        "score_breakdown": breakdown,
        "summary": {
            "at_or_above_target": sum(
                s["your_level_pct"]
                >= s["role_target_pct"]
                for s in results
            ),
            "need_real_depth": sum(
                s["depth_call"] == "MASTER"
                and s["gap"] > 0
                for s in results
            ),
            "already_past_target": sum(
                s["your_level_pct"]
                > s["role_target_pct"]
                for s in results
            ),
        },
        "skills": results,
        "biggest_lever": (
            max(
                results,
                key=lambda x: x["gap"],
            )["name"]
            if results
            else None
        ),
        "answers": answers,
        "gemini_summary": saved.get("gemini_summary", {}),
        "evaluations": saved.get("evaluations", []),
    }


@app.get("/me/skill-gap")
def current_skill_gap(
    user=Depends(current_user),
):

    conn = db()

    row = conn.execute(
        """
        SELECT session_id
        FROM analyses
        WHERE user_id=?
        AND status='complete'
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (user["id"],),
    ).fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            404,
            "No completed skill assessment yet.",
        )

    return get_result(
        row["session_id"],
        user["id"],
    )


@app.get("/skill-gap/{session_id}")
def skill_gap(
    session_id,
    user=Depends(current_user),
):

    return get_result(
        session_id,
        user["id"],
    )


# ============================================================
# ROADMAP STORAGE
# ============================================================

def persist_roadmap(
    assessment_id,
    user_id,
    roadmap,
    version=None,
):

    conn = db()

    if version is None:
        version = conn.execute(
            """
            SELECT COALESCE(MAX(version),0)+1
            FROM roadmaps
            WHERE assessment_id=?
            """,
            (assessment_id,),
        ).fetchone()[0]

    conn.execute(
        """
        UPDATE roadmaps
        SET
            status='archived',
            updated_at=?
        WHERE user_id=?
        AND status='active'
        """,
        (
            now(),
            user_id,
        ),
    )

    rid = uuid.uuid4().hex
    stamp = now()

    conn.execute(
        """
        INSERT INTO roadmaps(
            id,
            user_id,
            assessment_id,
            version,
            duration_months,
            goal,
            weekly_hours,
            data_json,
            created_at,
            updated_at
        )
        VALUES(?,?,?,?,?,?,?,?,?,?)
        """,
        (
            rid,
            user_id,
            assessment_id,
            version,
            int(
                roadmap["duration_months"]
            ),
            roadmap["goal"],
            float(
                roadmap["weekly_hours"]
            ),
            json.dumps(roadmap),
            stamp,
            stamp,
        ),
    )

    conn.commit()
    conn.close()

    return rid


# ============================================================
# CURRENT ROADMAP
# ============================================================

@app.get("/me/roadmap")
def current_roadmap(
    user=Depends(current_user),
):

    conn = db()

    row = conn.execute(
        """
        SELECT *
        FROM roadmaps
        WHERE user_id=?
        AND status='active'
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (user["id"],),
    ).fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            404,
            "No roadmap yet. Complete an assessment first.",
        )

    return {
        **json.loads(
            row["data_json"]
        ),
        "roadmap_id": row["id"],
        "version": row["version"],
        "assessment_id": row["assessment_id"],
    }


# ============================================================
# ROADMAP HISTORY
# ============================================================

@app.get("/roadmap/history")
def roadmap_history(
    user=Depends(current_user),
):

    conn = db()

    rows = conn.execute(
        """
        SELECT
            id,
            assessment_id,
            version,
            duration_months,
            goal,
            weekly_hours,
            status,
            created_at,
            updated_at
        FROM roadmaps
        WHERE user_id=?
        ORDER BY created_at DESC
        """,
        (user["id"],),
    ).fetchall()

    conn.close()

    return [
        dict(r)
        for r in rows
    ]


# ============================================================
# ROADMAP BY SESSION
# ============================================================

@app.get("/roadmap/{session_id}")
def roadmap(
    session_id,
    user=Depends(current_user),
):

    row = load_analysis(
        session_id,
        user["id"],
    )

    if row["status"] != "complete":
        raise HTTPException(
            400,
            "Complete the guided chat first.",
        )

    saved = json.loads(
        row["roadmap_json"] or "{}"
    )

    if not saved:
        saved = build_roadmap(
            get_result(
                session_id,
                user["id"],
            )
        )

    return saved


# ============================================================
# CREATE / CUSTOMIZE ROADMAP
# ============================================================

@app.post("/roadmap/{session_id}/create")
def roadmap_create(
    session_id: str,
    data: RoadmapCreate,
    user=Depends(current_user),
):

    result = get_result(
        session_id,
        user["id"],
    )

    roadmap_data = build_roadmap(
        result,
        data.duration_months,
        data.goal,
        data.weekly_hours,
    )

    conn = db()

    old = conn.execute(
        """
        SELECT data_json
        FROM roadmaps
        WHERE assessment_id=?
        AND status='active'
        """,
        (session_id,),
    ).fetchone()

    completed = set()

    if old:

        old_data = json.loads(
            old["data_json"]
        )

        completed = {
            t["id"]
            for phase in old_data.get(
                "phases",
                [],
            )
            for skill in phase.get(
                "skills",
                [],
            )
            for t in skill.get(
                "tasks",
                [],
            )
            if t.get("done")
        }

    conn.close()

    for phase in roadmap_data["phases"]:

        for skill in phase["skills"]:

            for task in skill["tasks"]:

                task["done"] = (
                    task["id"] in completed
                )

    persist_roadmap(
        session_id,
        user["id"],
        roadmap_data,
    )

    return roadmap_data


# ============================================================
# ROADMAP PROGRESS
# ============================================================

@app.post("/roadmap/{session_id}/progress")
def roadmap_progress(
    session_id,
    data: ProgressUpdate,
    user=Depends(current_user),
):

    row = load_analysis(
        session_id,
        user["id"],
    )

    roadmap_data = json.loads(
        row["roadmap_json"] or "{}"
    )

    changed = False

    for phase in roadmap_data.get(
        "phases",
        [],
    ):

        for skill in phase.get(
            "skills",
            [],
        ):

            for task in skill.get(
                "tasks",
                [],
            ):

                if task["id"] == data.task_id:

                    task["done"] = data.done
                    changed = True

    if not changed:
        raise HTTPException(
            404,
            "Roadmap task not found.",
        )

    conn = db()

    conn.execute(
        """
        UPDATE analyses
        SET
            roadmap_json=?,
            updated_at=?
        WHERE session_id=?
        """,
        (
            json.dumps(roadmap_data),
            now(),
            session_id,
        ),
    )

    conn.execute(
        """
        UPDATE roadmaps
        SET
            data_json=?,
            updated_at=?
        WHERE assessment_id=?
        AND status='active'
        """,
        (
            json.dumps(roadmap_data),
            now(),
            session_id,
        ),
    )

    conn.commit()
    conn.close()

    return roadmap_data


# ============================================================
# ROADMAP ADAPTATION
# ============================================================

@app.post("/roadmap/{session_id}/adapt")
def roadmap_adapt(
    session_id,
    data: RoadmapAdapt,
    user=Depends(current_user),
):

    result = get_result(
        session_id,
        user["id"],
    )

    old = current_roadmap(user)

    duration = (
        data.duration_months
        or old.get(
            "duration_months",
            3,
        )
    )

    weekly = (
        data.weekly_hours
        or old.get(
            "weekly_hours",
            user.get(
                "weekly_hours",
                8,
            ),
        )
    )

    goal = (
        data.goal
        or old.get(
            "goal",
            user.get(
                "learning_goal",
                "Job Ready",
            ),
        )
    )

    llm = generate_json(
        f"""
Return ONLY JSON:

{{
  "duration_months": number,
  "weekly_hours": number,
  "goal": "string"
}}

Adapt this learning plan.

Current:
duration={duration}
weekly_hours={weekly}
goal={goal}

Reason:
{data.reason}

Details:
{data.details}

Keep values realistic.
"""
    )

    if llm:

        duration = max(
            1,
            min(
                24,
                int(
                    llm.get(
                        "duration_months",
                        duration,
                    )
                ),
            ),
        )

        weekly = max(
            1,
            min(
                40,
                float(
                    llm.get(
                        "weekly_hours",
                        weekly,
                    )
                ),
            ),
        )

        goal = str(
            llm.get(
                "goal",
                goal,
            )
        )[:80]

    new = build_roadmap(
        result,
        duration,
        goal,
        weekly,
    )

    old_tasks = {
        t["id"]: t.get(
            "done",
            False,
        )
        for phase in old.get(
            "phases",
            [],
        )
        for skill in phase.get(
            "skills",
            [],
        )
        for t in skill.get(
            "tasks",
            [],
        )
    }

    for phase in new["phases"]:

        for skill in phase["skills"]:

            for task in skill["tasks"]:

                task["done"] = old_tasks.get(
                    task["id"],
                    False,
                )

    persist_roadmap(
        session_id,
        user["id"],
        new,
    )

    conn = db()

    conn.execute(
        """
        UPDATE analyses
        SET
            roadmap_json=?,
            updated_at=?
        WHERE session_id=?
        """,
        (
            json.dumps(new),
            now(),
            session_id,
        ),
    )

    conn.commit()
    conn.close()

    return new


# ============================================================
# ANALYSES
# ============================================================

@app.get("/analyses")
def analyses(
    user=Depends(current_user),
):

    conn = db()

    rows = conn.execute(
        """
        SELECT
            session_id,
            role_id,
            status,
            created_at,
            updated_at
        FROM analyses
        WHERE user_id=?
        ORDER BY updated_at DESC
        """,
        (user["id"],),
    ).fetchall()

    conn.close()

    return [
        dict(r)
        for r in rows
    ]


# ============================================================
# REANALYZE
# ============================================================

@app.post("/reanalyze/{session_id}")
def reanalyze(
    session_id,
    user=Depends(current_user),
):

    row = load_analysis(
        session_id,
        user["id"],
    )

    result = chat_start(
        ChatStart(
            role_id=row["role_id"]
        ),
        user,
    )

    result["role_id"] = row["role_id"]

    return result