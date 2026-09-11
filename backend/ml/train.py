"""Train the ED-02 baseline risk model.

Usage:
  python -m backend.ml.train --data-dir /path/to/oulad --output-dir backend/ml/artifacts
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from .feature_pipeline import build_day90_dataset, KEYS, TARGET
from .metrics import classification_metrics


def make_pipeline(X):
    categorical = X.select_dtypes(exclude=np.number).columns.tolist()
    numeric = X.select_dtypes(include=np.number).columns.tolist()
    pre = ColumnTransformer([
        ("num", Pipeline([( "impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
        ("cat", Pipeline([( "impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
    ])
    return Pipeline([("pre", pre), ("model", LogisticRegression(max_iter=2000, class_weight="balanced", random_state=20260911))])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", required=True)
    ap.add_argument("--output-dir", default="backend/ml/artifacts")
    args = ap.parse_args()
    df = build_day90_dataset(args.data_dir)
    X = df.drop(columns=[TARGET, *KEYS])
    y = df[TARGET].astype(int)
    groups = df["id_student"]
    gss = GroupShuffleSplit(n_splits=1, test_size=.2, random_state=20260911)
    train_idx, test_idx = next(gss.split(X, y, groups))
    model = make_pipeline(X)
    model.fit(X.iloc[train_idx], y.iloc[train_idx])
    probability = model.predict_proba(X.iloc[test_idx])[:, 1]
    metrics = classification_metrics(y.iloc[test_idx], probability)
    out = Path(args.output_dir); out.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, out / "ed02_logistic.joblib")
    (out / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
