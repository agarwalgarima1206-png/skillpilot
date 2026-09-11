export const earlyWarningMock = {
  prediction: { probability: 0.74, band: "high", confidence: 0.84, stage: "baseline", is_baseline: true },
  explanation: {
    features: [
      { name: "Skill gap", attribution: 0.31, evidence: "Current demonstrated skill levels leave a measurable gap to target depth." },
      { name: "Assessment activity", attribution: 0.27, evidence: "Limited assessment evidence reduces certainty about current mastery." },
      { name: "Submission consistency", attribution: 0.22, evidence: "Sparse evidence makes consistent learning behaviour harder to establish." },
      { name: "VLE engagement", attribution: 0.12, evidence: "Learning activity should be monitored over time." },
      { name: "Recent performance", attribution: 0.08, evidence: "Recent performance evidence is limited in the current product dataset." },
    ],
    compactness: 1,
  },
  stability: { score: 0.94, perturbations_tested: 10, status: "demo" },
  intervention: { priority: "high", actions: ["Prioritize the largest skill gap this week.", "Complete the next highest-gap roadmap task."] },
  metadata: { model_version: "demo-1.0", feature_version: "demo-1.0", source: "demo", benchmark: "ED-02_pending" },
};
