from __future__ import annotations

import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from google import genai

# Load variables from backend/.env
load_dotenv()


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

_client: genai.Client | None = None


def get_client() -> genai.Client | None:
    """
    Create the Gemini client only when it is needed.
    """
    global _client

    if not GEMINI_API_KEY:
        return None

    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)

    return _client


def gemini_available() -> bool:
    """
    Returns True when Gemini is configured.
    """
    return bool(GEMINI_API_KEY)


# ============================================================
# JSON HELPERS
# ============================================================

def clean_json_text(text: str) -> str:
    """
    Removes markdown code fences if Gemini returns JSON inside
    ```json ... ```
    """
    text = (text or "").strip()

    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    return text.strip()


def parse_json_response(text: str) -> dict[str, Any] | None:
    """
    Safely parse Gemini's response as JSON.
    """
    if not text:
        return None

    cleaned = clean_json_text(text)

    try:
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        pass

    # Fallback: try extracting the first JSON object.
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)

    if not match:
        return None

    try:
        data = json.loads(match.group(0))
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        return None


# ============================================================
# LOW-LEVEL GEMINI CALL
# ============================================================

def generate_text(prompt: str) -> str | None:
    """
    Send a prompt to Gemini and return plain text.
    """
    client = get_client()

    if client is None:
        return None

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )

        text = getattr(response, "text", None)

        if not text:
            return None

        return text.strip()

    except Exception as exc:
        print(f"[Gemini] Request failed: {exc}")
        return None


def generate_json(prompt: str) -> dict[str, Any] | None:
    """
    Ask Gemini for JSON and safely parse the response.
    """
    text = generate_text(prompt)

    if not text:
        return None

    return parse_json_response(text)


# ============================================================
# ADAPTIVE ASSESSMENT
# ============================================================

def evaluate_answer(
    role_title: str,
    skills: list[dict[str, Any]],
    conversation: list[dict[str, str]],
    current_question: str,
    user_answer: str,
) -> dict[str, Any] | None:
    """
    Analyze one user answer.

    Gemini evaluates:
    - current skill level
    - confidence
    - evidence in the answer
    - strengths
    - gaps
    - best next question
    """

    skills_text = json.dumps(skills, ensure_ascii=False)

    conversation_text = json.dumps(
        conversation,
        ensure_ascii=False,
        indent=2,
    )

    prompt = f"""
You are the assessment engine for SkillPilot, an AI-era career
and skill navigation platform.

The user's target career role is:
{role_title}

The role's important skills are:
{skills_text}

Previous assessment conversation:
{conversation_text}

Current assessment question:
{current_question}

User's latest answer:
{user_answer}

Your job is to evaluate the user's REAL demonstrated experience.

IMPORTANT RULES:

1. Do NOT invent experience.
2. Separate familiarity from hands-on ability.
3. A certificate or coursework alone does not prove strong practical depth.
4. A project is stronger evidence when the user can explain what they personally did.
5. Independent work, debugging, trade-offs, validation and real outcomes
   indicate stronger depth.
6. Be conservative when evidence is weak.
7. Identify what the answer actually proves.
8. Decide what the MOST useful next question should be.
9. The next question should probe a weakness, uncertainty or deeper level,
   rather than repeating the same question.
10. Keep the assessment focused on the selected career role.

Return ONLY valid JSON with this exact structure:

{{
  "skill": "most relevant skill",
  "current_level": 0,
  "confidence": 0.0,
  "evidence": [
    "specific evidence from the user's answer"
  ],
  "strengths": [
    "short strength"
  ],
  "gaps": [
    "short gap"
  ],
  "assessment": "one short explanation",
  "next_question": "one adaptive question",
  "question_reason": "why this question is useful"
}}

Scoring guide:

0-25:
Very limited exposure or mostly unfamiliar.

26-50:
Basic awareness, coursework or guided practice.

51-70:
Working knowledge and some project experience.

71-85:
Strong practical ability with meaningful independent work.

86-100:
Advanced depth, strong ownership, validation, trade-off decisions
and/or production-level experience.

Do not award a high score just because the user uses technical terminology.
"""

    result = generate_json(prompt)

    if not result:
        return None

    # --------------------------------------------------------
    # Normalize Gemini output
    # --------------------------------------------------------

    try:
        result["current_level"] = max(
            0,
            min(100, int(result.get("current_level", 45)))
        )
    except (TypeError, ValueError):
        result["current_level"] = 45

    try:
        result["confidence"] = max(
            0.0,
            min(1.0, float(result.get("confidence", 0.5)))
        )
    except (TypeError, ValueError):
        result["confidence"] = 0.5

    for field in ["evidence", "strengths", "gaps"]:
        value = result.get(field, [])

        if not isinstance(value, list):
            value = [str(value)] if value else []

        result[field] = [
            str(item).strip()
            for item in value
            if str(item).strip()
        ][:5]

    result["skill"] = str(
        result.get("skill", "")
    ).strip()

    result["assessment"] = str(
        result.get("assessment", "")
    ).strip()

    result["next_question"] = str(
        result.get("next_question", "")
    ).strip()

    result["question_reason"] = str(
        result.get("question_reason", "")
    ).strip()

    return result


# ============================================================
# CHOOSE NEXT QUESTION
# ============================================================

def generate_next_question(
    role_title: str,
    skills: list[dict[str, Any]],
    conversation: list[dict[str, str]],
    latest_evaluation: dict[str, Any],
) -> dict[str, Any] | None:
    """
    Generate the next adaptive question from the complete
    assessment context.
    """

    skills_text = json.dumps(skills, ensure_ascii=False)

    conversation_text = json.dumps(
        conversation,
        ensure_ascii=False,
        indent=2,
    )

    evaluation_text = json.dumps(
        latest_evaluation,
        ensure_ascii=False,
        indent=2,
    )

    prompt = f"""
You are the adaptive assessment controller for SkillPilot.

Target role:
{role_title}

Role skills:
{skills_text}

Conversation so far:
{conversation_text}

Latest evaluation:
{evaluation_text}

Choose the SINGLE BEST next question.

The next question should:
- investigate an important skill gap
- increase or decrease difficulty based on evidence
- avoid repeating previous questions
- test practical depth rather than memorized theory
- be understandable to a college student or early-career professional
- help distinguish between BASIC awareness, AI-AUGMENT capability,
  and MASTER-level human judgment

Return ONLY JSON:

{{
  "next_question": "question text",
  "target_skill": "skill being tested",
  "difficulty": "basic|intermediate|advanced",
  "reason": "why this question is the next best question",
  "quick_replies": ["short suggested answer 1", "short suggested answer 2", "short suggested answer 3", "short suggested answer 4"]
}}
"""

    result = generate_json(prompt)

    if not result:
        return None

    return {
        "next_question": str(
            result.get("next_question", "")
        ).strip(),
        "target_skill": str(
            result.get("target_skill", "")
        ).strip(),
        "difficulty": str(
            result.get("difficulty", "intermediate")
        ).strip().lower(),
        "reason": str(
            result.get("reason", "")
        ).strip(),
        "quick_replies": [
            str(x).strip()
            for x in (result.get("quick_replies") or [])
            if str(x).strip()
        ][:4],
    }


# ============================================================
# FINAL ASSESSMENT SUMMARY
# ============================================================

def generate_assessment_summary(
    role_title: str,
    skills: list[dict[str, Any]],
    conversation: list[dict[str, str]],
) -> dict[str, Any] | None:
    """
    At the end of the assessment, Gemini produces a final
    human-readable assessment summary.
    """

    prompt = f"""
You are the final assessment analyst for SkillPilot.

Target career:
{role_title}

Role skill framework:
{json.dumps(skills, ensure_ascii=False, indent=2)}

Complete assessment conversation:
{json.dumps(conversation, ensure_ascii=False, indent=2)}

Analyze the entire conversation.

Return ONLY JSON:

{{
  "overall_summary": "2-4 sentence summary",
  "strongest_area": "strongest demonstrated skill",
  "biggest_gap": "most important skill gap",
  "recommended_focus": [
    "focus area 1",
    "focus area 2",
    "focus area 3"
  ],
  "ai_collaboration_level": 0,
  "human_judgment_level": 0,
  "adaptability_level": 0,
  "confidence": 0.0
}}

Scoring:
0-25 = very limited
26-50 = basic
51-70 = working
71-85 = strong
86-100 = advanced

Be evidence-based.
Do not invent accomplishments.
"""

    result = generate_json(prompt)

    if not result:
        return None

    numeric_fields = [
        "ai_collaboration_level",
        "human_judgment_level",
    ]

    for field in numeric_fields:
        try:
            result[field] = max(
                0,
                min(100, int(result.get(field, 50)))
            )
        except (TypeError, ValueError):
            result[field] = 50

    try:
        result["confidence"] = max(
            0.0,
            min(1.0, float(result.get("confidence", 0.5)))
        )
    except (TypeError, ValueError):
        result["confidence"] = 0.5

    recommended = result.get("recommended_focus", [])

    if not isinstance(recommended, list):
        recommended = [str(recommended)]

    result["recommended_focus"] = [
        str(item).strip()
        for item in recommended
        if str(item).strip()
    ][:5]

    return result


# ============================================================
# CHAT RESPONSE HELPER
# ============================================================

def generate_supportive_acknowledgement(
    role_title: str,
    user_answer: str,
    evaluation: dict[str, Any],
) -> str:
    """
    Generate a short natural-language acknowledgement before
    asking the next question.
    """

    prompt = f"""
You are SkillPilot's friendly career assessment assistant.

Target role:
{role_title}

User answer:
{user_answer}

Evaluation:
{json.dumps(evaluation, ensure_ascii=False)}

Write ONE short acknowledgement.

Rules:
- sound natural and encouraging
- do not exaggerate the user's ability
- mention a useful signal from the answer
- do not give career advice yet
- do not ask another question
- maximum 2 sentences

Return plain text only.
"""

    text = generate_text(prompt)

    if text:
        return text.strip()

    # Safe fallback when Gemini is unavailable.
    level = evaluation.get("current_level", 45)

    if level >= 75:
        return (
            "Good signal — that shows meaningful hands-on experience. "
            "I'll use it to probe the depth behind that experience."
        )

    if level >= 50:
        return (
            "Got it. That gives me a useful picture of your current "
            "working knowledge."
        )

    return (
        "Thanks — that helps me understand where your current "
        "experience is starting from."
    )


# ============================================================
# HEALTH / DEBUG INFO
# ============================================================

def gemini_status() -> dict[str, Any]:
    """
    Useful for /health or debugging.
    Does NOT expose the API key.
    """

    return {
        "configured": bool(GEMINI_API_KEY),
        "model": GEMINI_MODEL,
    }
