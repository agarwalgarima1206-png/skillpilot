"""ED-02 explanation perturbation and stability metrics."""
from __future__ import annotations
import random
from typing import Callable, Sequence


def perturb_vle_counts(row: dict, feature_names: Sequence[str], seed: int) -> dict:
    rng = random.Random(seed)
    result = dict(row)
    for name in feature_names:
        if not name.startswith("vle_clicks_"):
            continue
        value = int(result.get(name, 0) or 0)
        if value > 0:
            result[name] = max(0, value + rng.choice((-1, 0, 1)))
    return result


def top_k(attributions: dict[str, float], k: int = 5) -> list[str]:
    return sorted(attributions, key=lambda n: (-abs(attributions[n]), n))[:k]


def jaccard(a: Sequence[str], b: Sequence[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa and not sb:
        return 1.0
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def explanation_stability(
    original: Sequence[str],
    perturbed: Sequence[Sequence[str]],
) -> float:
    if not perturbed:
        return 0.0
    return sum(jaccard(original, p) for p in perturbed) / len(perturbed)


def compactness(attributions: dict[str, float], k: int = 5) -> float:
    values = {k_: abs(float(v)) for k_, v in attributions.items()}
    total = sum(values.values())
    if total == 0:
        return 0.0
    return sum(values[n] for n in top_k(values, k)) / total
