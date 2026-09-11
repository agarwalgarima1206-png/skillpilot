# ED-02 implementation boundary

ED-02 is the formal benchmark layer. It must use OULAD day-90 features, student-level splits,
10 perturbations of nonzero VLE counts by -1/0/+1, normalized absolute attributions, top-5
explanation sets, Jaccard stability, compactness, AUROC/AUPRC and Brier.

The product-facing early-warning API is isolated behind `contracts/early-warning-v1.json`.
The current fallback signal exists only to keep the product runnable before the benchmark model
is trained. It must not be presented as an official ED-02 score.


## Product flow: baseline before Skill Gap / Roadmap

The product establishes a **baseline risk immediately when the adaptive assessment completes**. The baseline uses assessment answers, per-question evaluation evidence, and role-target comparison that are available at that point. The Skill Gap page and Roadmap are downstream presentations/actions built from the same assessment evidence; they are not prerequisites for calculating baseline risk.

The later ED-02/OULAD phase can replace this product baseline with a longitudinal updated-risk model once learning activity and assessment history accumulate. The UI should distinguish `baseline` from `updated` risk and must not present the baseline fallback as a validated ED-02 benchmark result.
