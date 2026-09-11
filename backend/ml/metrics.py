from __future__ import annotations
import numpy as np
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score


def classification_metrics(y_true, probability):
    return {
        "auroc": float(roc_auc_score(y_true, probability)),
        "auprc": float(average_precision_score(y_true, probability)),
        "brier": float(brier_score_loss(y_true, probability)),
        "predictive_utility": float((roc_auc_score(y_true, probability) + average_precision_score(y_true, probability)) / 2),
    }
