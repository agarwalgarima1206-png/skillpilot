# SkillPilot ED-02 ML layer

This folder is intentionally independent from `backend/app/`. It is the ML/XAI team's ownership boundary.

## Pipeline

1. `feature_pipeline.py` builds OULAD day-90 enrolment features.
2. `train.py` trains a calibrated student-risk model using student-disjoint splits.
3. `stability.py` implements the ED-02 perturbation and Jaccard logic.
4. `evaluate.py` should report AUROC, AUPRC, Brier, stability, compactness and runtime.
5. `predict.py` exposes a small contract for the backend integration layer.

The trained artifact is deliberately ignored by Git. Never commit OULAD target labels, held-out labels, or lookup tables.
