"""Prediction and feature attribution adapter for the ED-02 baseline model."""
from __future__ import annotations
from pathlib import Path
import joblib
import numpy as np

DEFAULT_MODEL = Path(__file__).resolve().parent / "artifacts" / "ed02_logistic.joblib"


def load_model(path=DEFAULT_MODEL):
    return joblib.load(path)


def _base_feature(name: str) -> str:
    if name.startswith("num__"):
        return name[len("num__"):]
    if name.startswith("cat__"):
        value = name[len("cat__"):]
        return value.rsplit("_", 1)[0] if "_" in value else value
    return name


def explain_row(model, row: dict) -> dict[str, float]:
    X = model.named_steps["pre"]
    estimator = model.named_steps["model"]
    frame = __import__("pandas").DataFrame([row])
    transformed = X.transform(frame)
    values = transformed.toarray()[0] if hasattr(transformed, "toarray") else transformed[0]
    names = X.get_feature_names_out()
    coeffs = estimator.coef_[0]
    grouped: dict[str, float] = {}
    for name, value, coef in zip(names, values, coeffs):
        base = _base_feature(name)
        grouped[base] = grouped.get(base, 0.0) + float(value * coef)
    return grouped


def predict(model, row: dict) -> dict:
    frame = __import__("pandas").DataFrame([row])
    probability = float(model.predict_proba(frame)[0, 1])
    attributions = explain_row(model, row)
    absolute = {k: abs(v) for k, v in attributions.items()}
    total = sum(absolute.values())
    normalized = {k: (v / total if total else 0.0) for k, v in absolute.items()}
    top = sorted(normalized, key=lambda k: (-normalized[k], k))[:5]
    return {"risk_probability": probability, "attributions": normalized, "top5": top}
