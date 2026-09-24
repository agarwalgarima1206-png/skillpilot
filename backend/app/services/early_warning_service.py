"""Product-facing early-warning service.

The live SkillPilot warning is an assessment-based baseline because normal
SkillPilot users do not have OULAD longitudinal telemetry.

The ED-02/OULAD model is trained and validated offline and exposed as the
validated benchmark behind the product. It is intentionally not applied to
SkillPilot assessment answers because those answers are not equivalent to
OULAD VLE/assessment features.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


FEATURE_LABELS = {
    "skill_gap": "Skill gap severity",
    "assessment_activity": "Assessment evidence",
    "submission_consistency": "Evidence consistency",
    "vle_engagement": "Learning engagement",
    "recent_performance": "Recent performance",
}


# ============================================================
# ED-02 / OULAD BENCHMARK
# ============================================================

ML_ARTIFACT_DIR = (
    Path(__file__).resolve().parents[2] / "ml" / "artifacts"
)

METRICS_FILE = ML_ARTIFACT_DIR / "metrics.json"
MODEL_FILE = ML_ARTIFACT_DIR / "ed02_logistic.joblib"


def _load_benchmark_metrics() -> dict[str, Any]:
    """Load saved ED-02/OULAD benchmark metrics if available."""
    try:
        if not METRICS_FILE.exists():
            return {}

        with METRICS_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)

        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _benchmark_metadata() -> dict[str, Any]:
    """Return truthful metadata about the trained OULAD benchmark."""
    metrics = _load_benchmark_metrics()

    return {
        "available": MODEL_FILE.exists(),
        "model": "ed02_logistic",
        "dataset": "OULAD",
        "training_mode": "offline",
        "application": "longitudinal benchmark",
        "auroc": metrics.get("auroc"),
        "auprc": metrics.get("auprc"),
        "brier": metrics.get("brier"),
        "predictive_utility": metrics.get("predictive_utility"),
    }


# ============================================================
# PRODUCT BASELINE
# ============================================================

def _band(p: float) -> str:
    return (
        "high"
        if p >= 0.70
        else "moderate"
        if p >= 0.40
        else "low"
    )


def build_product_early_warning(
    *,
    skills: list[dict[str, Any]] | None = None,
    answers: dict[str, str] | None = None,
    stage: str = "baseline",
) -> dict[str, Any]:
    """Build a live assessment-based baseline risk signal."""

    skills = skills or []
    answers = answers or {}

    gaps = [
        max(0, 100 - float(s.get("your_level_pct", 0)))
        for s in skills
    ]

    avg_gap = (
        sum(gaps) / len(gaps)
        if gaps
        else 35.0
    )

    answer_count = len(
        [
            v
            for v in answers.values()
            if str(v).strip()
        ]
    )

    evidence_count = sum(
        len(s.get("evidence", []) or [])
        for s in skills
    )

    probability = max(
        0.05,
        min(
            0.95,
            0.20
            + min(0.42, avg_gap / 240)
            + (0.08 if answer_count < 4 else 0)
            + (0.06 if evidence_count < 3 else 0),
        ),
    )

    confidence = max(
        0.45,
        min(
            0.90,
            0.52 + min(0.30, evidence_count / 20),
        ),
    )

    raw = {
        "skill_gap": min(
            0.48,
            avg_gap / 180,
        ),
        "assessment_activity": (
            0.20
            if answer_count < 4
            else 0.10
        ),
        "submission_consistency": (
            0.14
            if evidence_count < 3
            else 0.07
        ),
        "vle_engagement": 0.08,
        "recent_performance": 0.06,
    }

    total = sum(raw.values()) or 1

    evidence = {
        "skill_gap": (
            "Your demonstrated skill levels leave a measurable "
            "gap to the selected role target."
        ),
        "assessment_activity": (
            "Your completed assessment provides the initial "
            "evidence used to establish a baseline risk."
        ),
        "submission_consistency": (
            "Consistency is estimated from the amount and "
            "completeness of assessment evidence currently available."
        ),
        "vle_engagement": (
            "No longitudinal learning telemetry is available yet; "
            "this factor is therefore low-weight at baseline."
        ),
        "recent_performance": (
            "No post-assessment performance history is available yet; "
            "this factor is therefore low-weight at baseline."
        ),
    }

    features = [
        {
            "name": FEATURE_LABELS[k],
            "attribution": round(
                v / total,
                4,
            ),
            "evidence": evidence[k],
        }
        for k, v in sorted(
            raw.items(),
            key=lambda x: x[1],
            reverse=True,
        )
    ][:5]

    band = _band(probability)

    actions = [
        (
            "Review the highest-priority skill gap identified "
            "by your assessment."
        ),
        (
            "Start the first targeted roadmap task and reassess "
            "after new learning evidence is collected."
        ),
    ]

    if band == "high":
        actions.insert(
            0,
            (
                "Prioritize your largest skill gap before moving "
                "deeper into the roadmap."
            ),
        )
    elif band == "low":
        actions.insert(
            0,
            (
                "Continue with the roadmap while monitoring your "
                "progress for new evidence."
            ),
        )

    benchmark = _benchmark_metadata()

    return {
        "prediction": {
            "probability": round(
                probability,
                4,
            ),
            "band": band,
            "confidence": round(
                confidence,
                4,
            ),
            "stage": stage,
            "is_baseline": stage == "baseline",
        },

        "explanation": {
            "features": features,
            "compactness": round(
                sum(
                    x["attribution"]
                    for x in features
                ),
                4,
            ),
        },

        "stability": {
            "score": 0.0,
            "perturbations_tested": 0,
            "status": "benchmark_available",
        },

        "intervention": {
            "priority": band,
            "actions": actions,
        },

        "metadata": {
            "model_version": "skillpilot-assessment-baseline-0.3",
            "feature_version": "skillpilot-assessment-0.3",
            "source": "skillpilot_assessment_baseline",
            "risk_basis": "completed_adaptive_assessment",

            "benchmark": "ED-02_OULAD",
            "benchmark_status": (
                "validated_offline"
                if benchmark["available"]
                else "artifact_unavailable"
            ),

            "benchmark_model": benchmark["model"],
            "benchmark_dataset": benchmark["dataset"],
            "benchmark_training_mode": benchmark["training_mode"],

            "benchmark_metrics": {
                "auroc": benchmark["auroc"],
                "auprc": benchmark["auprc"],
                "brier": benchmark["brier"],
                "predictive_utility": benchmark[
                    "predictive_utility"
                ],
            },

            "benchmark_note": (
                "The OULAD model is trained and evaluated on "
                "longitudinal OULAD data. It is not applied to "
                "SkillPilot assessment answers because those "
                "answers do not contain equivalent OULAD telemetry."
            ),
        },
    }
