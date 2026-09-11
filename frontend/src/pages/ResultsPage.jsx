import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  RotateCcw,
  Network,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { getCurrentSkillGap, reanalyze } from "../services/api";
import { useUser } from "../context/UserContext";

const depthClass = {
  MASTER: "bg-gray-900 text-white",
  "AI-AUGMENT": "bg-indigo-600 text-white",
  "BASIC-AWARENESS": "bg-gray-200 text-gray-700",
};

const depthLabels = {
  MASTER: "MASTER",
  "AI-AUGMENT": "AI-AUGMENT",
  "BASIC-AWARENESS": "BASIC AWARENESS",
};

const depthDescriptions = {
  MASTER:
    "This skill needs deep human judgment. You should be able to reason, make decisions, validate outcomes, and explain why your approach is correct.",
  "AI-AUGMENT":
    "AI can accelerate this skill, but you still need enough depth to guide AI, verify its output, debug problems, and make the final decision.",
  "BASIC-AWARENESS":
    "You do not need deep specialization here. Focus on understanding the fundamentals, knowing when the skill is useful, and checking AI-generated work.",
};

export default function ResultsPage() {
  const nav = useNavigate();

  // UPDATED: UserContext now provides updateUser()
  const { updateUser } = useUser();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [openDepth, setOpenDepth] = useState(null);

  useEffect(() => {
    loadSkillGap();
  }, []);

  const loadSkillGap = async () => {
    try {
      setError("");

      const result = await getCurrentSkillGap();

      setData(result);

      // Keep frontend context synchronized
      if (updateUser) {
        updateUser({
          role: result.role || null,
          roleId: result.role_id || null,
          sessionId: result.session_id || null,
        });
      }
    } catch (e) {
      setError(e.message || "Unable to load your skill gap.");
    }
  };

  const newAssessment = async () => {
    if (!data?.session_id) return;

    setBusy(true);
    setError("");

    try {
      const result = await reanalyze(data.session_id);

      // Save the new assessment session
      if (updateUser) {
        updateUser({
          role: result.role || data.role || null,
          roleId: result.role_id || data.role_id || null,
          sessionId: result.session_id || null,
        });
      }

      nav(`/chat?role=${result.role_id}`);
    } catch (e) {
      setError(e.message || "Unable to start a new assessment.");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-14">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="font-serif text-2xl font-bold">
            Your skill gap isn't ready yet.
          </h1>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <Link
            to="/chat"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Start assessment
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#fafafa] p-10">
        <div className="text-sm text-gray-500">
          Loading your saved skill gap…
        </div>
      </main>
    );
  }

  const breakdown = data.score_breakdown || {};

  const coverage =
    breakdown.skill_coverage ??
    breakdown.breadth ??
    0;

  const humanCore =
    breakdown.human_core ??
    breakdown.human_judgment ??
    0;

  const aiSupervision =
    breakdown.ai_supervision ??
    breakdown.ai_collaboration ??
    0;

  const score = Number(data.ai_resilience_score ?? 0);

  const summary = data.summary || {};

  const skills = Array.isArray(data.skills) ? data.skills : [];

  const scoreLabel =
    score >= 80
      ? "Strong AI Resilience"
      : score >= 60
        ? "Developing AI Resilience"
        : "Early AI Resilience";

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
              YOUR SKILL GAP
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold">
              {data.role} profile
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Your assessment combines demonstrated skill depth,
              human judgment, AI collaboration, and role-specific
              coverage to create an AI Resilience profile.
            </p>
          </div>

          {/* SCORE CARD */}
          <div className="rounded-2xl border bg-white px-8 py-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                AI RESILIENCE
              </span>
            </div>

            <div className="mt-2 text-5xl font-bold text-indigo-600">
              {score}
            </div>

            <div className="mt-1 text-xs font-semibold text-gray-500">
              {scoreLabel}
            </div>
          </div>
        </div>

        {/* SCORE EXPLANATION */}
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-indigo-600" />

            <h2 className="text-sm font-bold">
              How your score works
            </h2>

            <span
              title="This is a learning-readiness metric, not an employment prediction."
              className="cursor-help"
            >
              <Info size={14} className="text-gray-400" />
            </span>
          </div>

          <p className="mt-2 max-w-4xl text-xs leading-5 text-gray-500">
            SkillPilot prioritizes human-core judgment and
            AI-supervision ability, while also measuring how broadly
            you cover the important skills for your selected role.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ScorePart
              label="Human judgment"
              value={humanCore}
              weight="55%"
            />

            <ScorePart
              label="AI collaboration"
              value={aiSupervision}
              weight="30%"
            />

            <ScorePart
              label="Skill coverage"
              value={coverage}
              weight="15%"
            />
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat
            label="At / above target"
            value={summary.at_or_above_target ?? 0}
          />

          <Stat
            label="Human-core gaps"
            value={summary.need_real_depth ?? 0}
          />

          <Stat
            label="Skill areas covered"
            value={
              breakdown.skill_coverage_label ||
              `${Math.round(coverage)}%`
            }
          />

          <Stat
            label="Biggest lever"
            value={data.biggest_lever || "—"}
          />
        </div>

        {/* INSIGHT BOX */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-white p-2 shadow-sm">
              <Sparkles size={17} className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Your biggest learning lever
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                <span className="font-semibold text-gray-900">
                  {data.biggest_lever || "Your biggest skill gap"}
                </span>{" "}
                currently needs the most attention. SkillPilot will
                prioritize this area in your roadmap instead of
                treating every skill equally.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* SKILL MAP */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Network size={18} className="text-indigo-600" />

              <h2 className="font-serif text-2xl font-bold">
                Skill map
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {skills.map((skill) => {
                const isOpen = openDepth === skill.name;

                const current = Number(
                  skill.your_level_pct ?? 0
                );

                const target = Number(
                  skill.role_target_pct ?? 0
                );

                const gap = Math.max(target - current, 0);

                const evidence = Array.isArray(skill.evidence)
                  ? skill.evidence
                  : [];

                const gaps = Array.isArray(skill.gaps)
                  ? skill.gaps
                  : [];

                return (
                  <article
                    key={skill.name}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {skill.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {skill.tier}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg px-2 py-1 text-[9px] font-bold ${
                          depthClass[skill.depth_call] ||
                          "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {depthLabels[skill.depth_call] ||
                          skill.depth_call}
                      </span>
                    </div>

                    {/* LEVEL */}
                    <div className="mt-5 flex justify-between text-[10px] text-gray-400">
                      <span>You {current}%</span>

                      <span>Target {target}%</span>
                    </div>

                    <div className="relative mt-1 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gray-900 transition-all"
                        style={{
                          width: `${Math.min(current, 100)}%`,
                        }}
                      />

                      <div
                        className="absolute top-[-3px] h-4 w-0.5 bg-indigo-600"
                        style={{
                          left: `${Math.min(target, 100)}%`,
                        }}
                      />
                    </div>

                    {/* GAP */}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs leading-5 text-gray-500">
                        {skill.note}
                      </p>

                      {gap > 0 && (
                        <span className="ml-3 shrink-0 rounded-full bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-600">
                          Gap {gap}%
                        </span>
                      )}
                    </div>

                    {/* WHY DEPTH */}
                    <button
                      onClick={() =>
                        setOpenDepth(isOpen ? null : skill.name)
                      }
                      className="mt-4 flex w-full items-center justify-between border-t pt-3 text-left"
                    >
                      <span className="text-xs font-semibold text-indigo-600">
                        Why this depth?
                      </span>

                      {isOpen ? (
                        <ChevronUp
                          size={14}
                          className="text-indigo-600"
                        />
                      ) : (
                        <ChevronDown
                          size={14}
                          className="text-indigo-600"
                        />
                      )}
                    </button>

                    {isOpen && (
                      <div className="mt-3 rounded-xl bg-gray-50 p-3">
                        <p className="text-xs leading-5 text-gray-600">
                          {depthDescriptions[skill.depth_call] ||
                            "Skill depth is based on the role's expected level and how AI changes the way this skill is performed."}
                        </p>

                        {/* EVIDENCE */}
                        {evidence.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Evidence detected
                            </p>

                            <div className="space-y-2">
                              {evidence.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex gap-2 text-xs text-gray-600"
                                >
                                  <CheckCircle2
                                    size={13}
                                    className="mt-0.5 shrink-0 text-green-600"
                                  />

                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* GAPS */}
                        {gaps.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Gaps detected
                            </p>

                            <div className="space-y-2">
                              {gaps.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex gap-2 text-xs text-gray-600"
                                >
                                  <AlertCircle
                                    size={13}
                                    className="mt-0.5 shrink-0 text-orange-500"
                                  />

                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          {/* RIGHT SIDE */}
          <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              WHAT NEXT?
            </p>

            <h2 className="mt-2 font-serif text-2xl font-bold">
              {data.biggest_lever || "Your skill gaps"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your roadmap prioritizes the areas where your current
              level is furthest from the role target.
            </p>

            <button
              onClick={() => nav("/roadmap")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
            >
              Open roadmap
              <ArrowRight size={15} />
            </button>

            <button
              onClick={newAssessment}
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold disabled:opacity-50"
            >
              <RotateCcw size={14} />

              {busy ? "Starting…" : "Re-assess me"}
            </button>

            <p className="mt-3 text-[10px] leading-4 text-gray-400">
              Re-assessment creates a new saved assessment.
              This assessment remains available in your history.
            </p>

            <div className="mt-5 border-t pt-4">
              <div className="flex items-start gap-2">
                <Info
                  size={14}
                  className="mt-0.5 shrink-0 text-gray-400"
                />

                <p className="text-[10px] leading-4 text-gray-400">
                  Skill depth is intentionally different for each
                  skill. SkillPilot does not assume every technology
                  should be learned to the same level.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="truncate text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {label}
      </p>
    </div>
  );
}

function ScorePart({ label, value, weight }) {
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="flex justify-between text-xs font-semibold">
        <span>{label}</span>

        <span>
          {safeValue}% · {weight}
        </span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}
