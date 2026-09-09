from __future__ import annotations

from typing import Any


def normalize_skill_name(
    name: str,
    role_skills: list[tuple],
) -> str | None:
    """
    Match Gemini's skill name to one of the role's configured skills.
    """

    cleaned = (name or "").strip().lower()

    if not cleaned:
        return None

    for skill in role_skills:
        configured_name = str(skill[0]).strip()

        if cleaned == configured_name.lower():
            return configured_name

    # Flexible matching
    for skill in role_skills:
        configured_name = str(skill[0]).strip().lower()

        if cleaned in configured_name or configured_name in cleaned:
            return str(skill[0]).strip()

    return None


def build_conversation(
    messages: list[dict[str, Any]],
) -> list[dict[str, str]]:
    """
    Convert stored chat messages into a compact conversation format
    that can be passed to Gemini.
    """

    conversation = []

    for message in messages:
        sender = str(message.get("sender", "")).lower()
        text = str(message.get("message", "")).strip()

        if not text:
            continue

        if sender == "user":
            role = "user"
        else:
            role = "assistant"

        conversation.append(
            {
                "role": role,
                "content": text,
            }
        )

    return conversation


def merge_gemini_evaluation(
    skill_result: dict[str, Any],
    evaluation: dict[str, Any] | None,
) -> dict[str, Any]:
    """
    Add Gemini's evidence, confidence and gaps to a skill result.
    """

    if not evaluation:
        skill_result.setdefault("evidence", [])
        skill_result.setdefault("gaps", [])
        skill_result.setdefault("confidence", 0.0)
        skill_result.setdefault("assessment", "")
        return skill_result

    evidence = evaluation.get("evidence", [])
    gaps = evaluation.get("gaps", [])
    strengths = evaluation.get("strengths", [])

    if not isinstance(evidence, list):
        evidence = [str(evidence)]

    if not isinstance(gaps, list):
        gaps = [str(gaps)]

    if not isinstance(strengths, list):
        strengths = [str(strengths)]

    skill_result["evidence"] = [
        str(x).strip()
        for x in evidence
        if str(x).strip()
    ][:5]

    skill_result["gaps"] = [
        str(x).strip()
        for x in gaps
        if str(x).strip()
    ][:5]

    skill_result["strengths"] = [
        str(x).strip()
        for x in strengths
        if str(x).strip()
    ][:5]

    try:
        skill_result["confidence"] = max(
            0.0,
            min(
                1.0,
                float(
                    evaluation.get(
                        "confidence",
                        0.5,
                    )
                ),
            ),
        )
    except (TypeError, ValueError):
        skill_result["confidence"] = 0.5

    skill_result["assessment"] = str(
        evaluation.get(
            "assessment",
            "",
        )
    ).strip()

    return skill_result


def apply_gemini_evaluations(
    skills: list[dict[str, Any]],
    evaluations: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Merge multiple Gemini evaluations into the final skill map.

    A skill may appear multiple times during the assessment.
    The strongest evidence is accumulated.
    """

    by_skill: dict[str, dict[str, Any]] = {}

    for evaluation in evaluations:
        skill_name = str(
            evaluation.get(
                "skill",
                "",
            )
        ).strip().lower()

        if not skill_name:
            continue

        existing = by_skill.setdefault(
            skill_name,
            {
                "evidence": [],
                "gaps": [],
                "strengths": [],
                "confidence": 0.0,
                "assessment": "",
                "current_levels": [],
            },
        )

        evidence = evaluation.get(
            "evidence",
            [],
        )

        gaps = evaluation.get(
            "gaps",
            [],
        )

        strengths = evaluation.get(
            "strengths",
            [])

        if not isinstance(evidence, list):
            evidence = [str(evidence)]

        if not isinstance(gaps, list):
            gaps = [str(gaps)]

        if not isinstance(strengths, list):
            strengths = [str(strengths)]

        existing["evidence"].extend(
            str(x).strip()
            for x in evidence
            if str(x).strip()
        )

        existing["gaps"].extend(
            str(x).strip()
            for x in gaps
            if str(x).strip()
        )

        existing["strengths"].extend(
            str(x).strip()
            for x in strengths
            if str(x).strip()
        )

        try:
            level = int(
                evaluation.get(
                    "current_level",
                    45,
                )
            )

            existing["current_levels"].append(
                max(
                    0,
                    min(100, level),
                )
            )
        except (TypeError, ValueError):
            pass

        try:
            confidence = float(
                evaluation.get(
                    "confidence",
                    0.5,
                )
            )

            existing["confidence"] = max(
                existing["confidence"],
                max(
                    0.0,
                    min(1.0, confidence),
                ),
            )
        except (TypeError, ValueError):
            pass

        assessment = str(
            evaluation.get(
                "assessment",
                "",
            )
        ).strip()

        if assessment:
            existing["assessment"] = assessment

    final_skills = []

    for skill in skills:

        name = str(
            skill.get(
                "name",
                "",
            )
        ).strip()

        match = None

        for key, value in by_skill.items():
            if (
                key == name.lower()
                or key in name.lower()
                or name.lower() in key
            ):
                match = value
                break

        if not match:
            skill.setdefault(
                "evidence",
                [],
            )
            skill.setdefault(
                "gaps",
                [],
            )
            skill.setdefault(
                "strengths",
                [],
            )
            skill.setdefault(
                "confidence",
                0.0,
            )
            skill.setdefault(
                "assessment",
                "",
            )

            final_skills.append(
                skill
            )
            continue

        skill["evidence"] = list(
            dict.fromkeys(
                match["evidence"]
            )
        )[:5]

        skill["gaps"] = list(
            dict.fromkeys(
                match["gaps"]
            )
        )[:5]

        skill["strengths"] = list(
            dict.fromkeys(
                match["strengths"]
            )
        )[:5]

        skill["confidence"] = round(
            match["confidence"],
            2,
        )

        skill["assessment"] = match[
            "assessment"
        ]

        # If Gemini assessed this skill directly,
        # use its average level as supporting evidence.
        if match["current_levels"]:
            average_level = round(
                sum(
                    match["current_levels"]
                )
                / len(
                    match["current_levels"]
                )
            )

            target = skill.get(
                "role_target_pct",
                75,
            )

            skill["gemini_level"] = average_level

            # Small controlled adjustment:
            # Gemini can refine, but should not radically
            # override the existing role framework.
            existing = int(
                skill.get(
                    "your_level_pct",
                    45,
                )
            )

            refined = round(
                existing * 0.4
                + average_level * 0.6
            )

            skill["your_level_pct"] = max(
                15,
                min(
                    95,
                    refined,
                ),
            )

            skill["gap"] = max(
                int(target)
                - skill["your_level_pct"],
                0,
            )

        final_skills.append(
            skill
        )

    return final_skills


def score_label(score: int) -> str:
    """
    Human-readable interpretation of AI Resilience Score.
    """

    if score >= 85:
        return "Highly AI-resilient"

    if score >= 70:
        return "Strong AI resilience"

    if score >= 55:
        return "Developing AI resilience"

    if score >= 40:
        return "Early-stage AI resilience"

    return "Needs foundational development"


def build_score_explanation(
    score: int,
    breakdown: dict[str, Any],
) -> str:
    """
    Generate a deterministic explanation that can be displayed
    on the Skill Gap page.
    """

    human = int(
        breakdown.get(
            "human_core",
            0,
        )
    )

    ai = int(
        breakdown.get(
            "ai_supervision",
            0,
        )
    )

    coverage = int(
        breakdown.get(
            "skill_coverage",
            0,
        )
    )

    weakest_dimension = min(
        [
            ("human judgment", human),
            ("AI collaboration", ai),
            ("skill coverage", coverage),
        ],
        key=lambda x: x[1],
    )[0]

    return (
        f"{score}/100 — {score_label(score)}. "
        f"Your current profile is strongest where you can "
        f"retain ownership of decisions while using AI as an accelerator. "
        f"The biggest dimension to strengthen is "
        f"{weakest_dimension}."
    )