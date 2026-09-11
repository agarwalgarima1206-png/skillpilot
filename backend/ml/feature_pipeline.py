"""Build ED-02 day-90 features from OULAD CSV files.

Expected input directory contains the standard OULAD CSV files:
studentInfo.csv, studentVle.csv, vle.csv, studentAssessment.csv, assessments.csv.
"""
from __future__ import annotations

from pathlib import Path
import pandas as pd

TARGET = "risky"
KEYS = ["id_student", "code_module", "code_presentation"]


def build_day90_dataset(data_dir: str | Path) -> pd.DataFrame:
    root = Path(data_dir)
    info = pd.read_csv(root / "studentInfo.csv")
    svle = pd.read_csv(root / "studentVle.csv")
    vle = pd.read_csv(root / "vle.csv")
    sa = pd.read_csv(root / "studentAssessment.csv")
    assessments = pd.read_csv(root / "assessments.csv")

    # OULAD's VLE date is relative to the presentation. Keep only day <= 90.
    svle = svle.loc[svle["date"].fillna(10**9) <= 90].copy()
    svle = svle.merge(vle[["id_site", "activity_type"]], on="id_site", how="left")
    svle["activity_type"] = svle["activity_type"].fillna("unknown").astype(str)
    vle_features = svle.pivot_table(
        index=KEYS,
        columns="activity_type",
        values="sum_click",
        aggfunc="sum",
        fill_value=0,
    ).reset_index()
    vle_features.columns = [
        *KEYS,
        *[f"vle_clicks_{str(c).lower().replace(' ', '_')}" for c in vle_features.columns[len(KEYS):]],
    ]

    # Assessment submission date is also relative to the presentation.
    sa = sa.merge(
        assessments[["id_assessment", "code_module", "code_presentation"]],
        on="id_assessment",
        how="left",
    )
    sa = sa.loc[sa["date_submitted"].fillna(10**9) <= 90].copy()
    assessment_features = sa.groupby(["id_student", "code_module", "code_presentation"], as_index=False).agg(
        submitted_assessment_count=("id_assessment", "nunique"),
        mean_submitted_assessment_score=("score", "mean"),
    )

    base = info.copy()
    base = base.loc[:, [
        "id_student", "code_module", "code_presentation", "gender", "region",
        "highest_education", "imd_band", "age_band", "disability", "final_result",
        "studied_credits", "num_of_prev_attempts",
    ]]
    base[TARGET] = base["final_result"].isin(["Fail", "Withdrawn"]).astype(int)
    base = base.drop(columns=["final_result"])

    out = base.merge(vle_features, on=KEYS, how="left")
    out = out.merge(assessment_features, on=KEYS, how="left")
    numeric = out.select_dtypes(include="number").columns
    out[numeric] = out[numeric].fillna(0)
    out["mean_submitted_assessment_score"] = out["mean_submitted_assessment_score"].fillna(0)
    return out


def split_xy(df: pd.DataFrame):
    """Return X, y after removing identifiers and target."""
    y = df[TARGET].astype(int)
    X = df.drop(columns=[TARGET, *KEYS])
    return X, y
