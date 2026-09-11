"""Evaluate an ED-02 model locally, including perturbation-based explanation stability."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import numpy as np
from .feature_pipeline import build_day90_dataset, KEYS, TARGET
from .metrics import classification_metrics
from .predict import load_model, predict
from .stability import perturb_vle_counts, explanation_stability, compactness


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", required=True)
    ap.add_argument("--model", default=str(Path(__file__).resolve().parent / "artifacts" / "ed02_logistic.joblib"))
    ap.add_argument("--perturbations", type=int, default=10)
    args = ap.parse_args()
    df = build_day90_dataset(args.data_dir)
    model = load_model(args.model)
    X = df.drop(columns=[TARGET, *KEYS])
    y = df[TARGET].astype(int)
    probability = model.predict_proba(X)[:, 1]
    metrics = classification_metrics(y, probability)
    feature_names = [c for c in X.columns if c.startswith("vle_clicks_")]
    stability_scores, compactness_scores = [], []
    sample = df.head(min(250, len(df)))
    for _, record in sample.iterrows():
        row = record.drop(labels=[TARGET, *KEYS]).to_dict()
        original = predict(model, row)
        perturbed_sets = []
        for seed in range(args.perturbations):
            changed = perturb_vle_counts(row, feature_names, seed)
            perturbed_sets.append(predict(model, changed)["top5"])
        stability_scores.append(explanation_stability(original["top5"], perturbed_sets))
        compactness_scores.append(compactness(original["attributions"]))
    metrics.update({"explanation_stability": float(np.mean(stability_scores)) if stability_scores else 0.0, "explanation_compactness": float(np.mean(compactness_scores)) if compactness_scores else 0.0, "perturbations_per_row": args.perturbations})
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
