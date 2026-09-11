"""Product-facing early-warning service.

The first warning is a BASELINE risk signal produced immediately after the adaptive
assessment is completed. It uses assessment evidence and skill-gap evidence that are
already available at that moment; Skill Gap and Roadmap are downstream views/actions,
not prerequisites for the warning.

This remains a deterministic product fallback, not the official ED-02/OULAD benchmark
model. The trained ED-02 model can replace the scoring implementation while keeping
this response contract stable.
"""
from __future__ import annotations
from typing import Any

FEATURE_LABELS = {
    "skill_gap": "Skill gap severity",
    "assessment_activity": "Assessment evidence",
    "submission_consistency": "Evidence consistency",
    "vle_engagement": "Learning engagement",
    "recent_performance": "Recent performance",
}


def _band(p: float) -> str:
    return "high" if p >= 0.70 else "moderate" if p >= 0.40 else "low"


def build_product_early_warning(
    *,
    skills: list[dict[str, Any]] | None = None,
    answers: dict[str, str] | None = None,
    stage: str = "baseline",
) -> dict[str, Any]:
    """Build a baseline risk signal from evidence available at assessment completion."""
    skills, answers = skills or [], answers or {}

    gaps = [max(0, 100 - float(s.get("your_level_pct", 0))) for s in skills]
    avg_gap = sum(gaps) / len(gaps) if gaps else 35.0
    answer_count = len([v for v in answers.values() if str(v).strip()])
    evidence_count = sum(len(s.get("evidence", []) or []) for s in skills)

    # Baseline only: no roadmap state or post-assessment activity is required.
    probability = max(
        .05,
        min(
            .95,
            .20
            + min(.42, avg_gap / 240)
            + (.08 if answer_count < 4 else 0)
            + (.06 if evidence_count < 3 else 0),
        ),
    )
    confidence = max(.45, min(.90, .52 + min(.30, evidence_count / 20)))

    raw = {
        "skill_gap": min(.48, avg_gap / 180),
        "assessment_activity": .20 if answer_count < 4 else .10,
        "submission_consistency": .14 if evidence_count < 3 else .07,
        # These are explicitly marked as limited baseline evidence. They are not
        # pretending that post-assessment VLE telemetry already exists.
        "vle_engagement": .08,
        "recent_performance": .06,
    }
    total = sum(raw.values()) or 1

    evidence = {
        "skill_gap": "Your demonstrated skill levels leave a measurable gap to the selected role target.",
        "assessment_activity": "Your completed assessment provides the initial evidence used to establish a baseline risk.",
        "submission_consistency": "Consistency is estimated from the amount and completeness of assessment evidence currently available.",
        "vle_engagement": "No longitudinal learning telemetry is available yet; this factor is therefore low-weight at baseline.",
        "recent_performance": "No post-assessment performance history is available yet; this factor is therefore low-weight at baseline.",
    }

    features = [
        {
            "name": FEATURE_LABELS[k],
            "attribution": round(v / total, 4),
            "evidence": evidence[k],
        }
        for k, v in sorted(raw.items(), key=lambda x: x[1], reverse=True)
    ][:5]

    band = _band(probability)
    actions = [
        "Review the highest-priority skill gap identified by your assessment.",
        "Start the first targeted roadmap task and reassess after new learning evidence is collected.",
    ]
    if band == "high":
        actions.insert(0, "Prioritize your largest skill gap before moving deeper into the roadmap.")
    elif band == "low":
        actions.insert(0, "Continue with the roadmap while monitoring your progress for new evidence.")

    return {
        "prediction": {
            "probability": round(probability, 4),
            "band": band,
            "confidence": round(confidence, 4),
            "stage": stage,
            "is_baseline": stage == "baseline",
        },
        "explanation": {
            "features": features,
            "compactness": round(sum(x["attribution"] for x in features), 4),
        },
        "stability": {
            "score": 0.0,
            "perturbations_tested": 0,
            "status": "benchmark_pending",
        },
        "intervention": {"priority": band, "actions": actions},
        "metadata": {
            "model_version": "product-baseline-0.2",
            "feature_version": "skillpilot-assessment-0.2",
            "source": "skillpilot_assessment_baseline",
            "risk_basis": "completed_adaptive_assessment",
            "benchmark": "ED-02_pending",
        },
    }
