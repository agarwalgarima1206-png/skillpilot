import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers3,
  Clock3,
  BookOpen,
  Download,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useUser } from "../context/UserContext";

function RoadmapPage() {
  const [activePhase, setActivePhase] = useState(1);

  const { userProfile } = useUser();

  // Get skills from shared UserContext
  const allSkills = userProfile?.skills || [];

  // Group skills according to FutureProof depth
  const phase1 = allSkills
    .filter((skill) => skill.depth === "MASTER")
    .sort(
      (a, b) =>
        Math.max(b.target - b.current, 0) -
        Math.max(a.target - a.current, 0)
    )
    .map((skill) => ({
      ...skill,
      type: "Human-Core",
      hours: getHours(skill),
      resource: getResource(skill),
      status: getStatus(skill),
    }));

  const phase2 = allSkills
    .filter((skill) => skill.depth === "AI-AUGMENT")
    .sort(
      (a, b) =>
        Math.max(b.target - b.current, 0) -
        Math.max(a.target - a.current, 0)
    )
    .map((skill) => ({
      ...skill,
      type: "AI-Augmented",
      hours: getHours(skill),
      resource: getResource(skill),
      status: getStatus(skill),
    }));

  const phase3 = allSkills
    .filter((skill) => skill.depth === "BASIC-AWARENESS")
    .sort(
      (a, b) =>
        Math.max(b.target - b.current, 0) -
        Math.max(a.target - a.current, 0)
    )
    .map((skill) => ({
      ...skill,
      type: "AI-Accelerated",
      hours: getHours(skill),
      resource: getResource(skill),
      status: getStatus(skill),
    }));

  const phases = [
    {
      id: 1,
      title: "Phase 1",
      days: "Days 1–30",
    },
    {
      id: 2,
      title: "Phase 2",
      days: "Days 31–60",
    },
    {
      id: 3,
      title: "Phase 3",
      days: "Days 61–90",
    },
  ];

  const getSkills = () => {
    if (activePhase === 1) return phase1;
    if (activePhase === 2) return phase2;
    return phase3;
  };

  const skills = getSkills();

  // Summary counts
  const masterCount = allSkills.filter(
    (skill) => skill.depth === "MASTER"
  ).length;

  const augmentCount = allSkills.filter(
    (skill) => skill.depth === "AI-AUGMENT"
  ).length;

  const awarenessCount = allSkills.filter(
    (skill) => skill.depth === "BASIC-AWARENESS"
  ).length;

  // Estimate total learning hours
  const totalHours = allSkills.reduce((sum, skill) => {
    const gap = Math.max(skill.target - skill.current, 0);

    if (skill.depth === "MASTER") {
      return sum + Math.round(gap * 0.55);
    }

    if (skill.depth === "AI-AUGMENT") {
      return sum + Math.round(gap * 0.3);
    }

    return sum + Math.round(gap * 0.1);
  }, 0);

  // Biggest learning gap
  const biggestGapSkill = [...allSkills].sort(
    (a, b) =>
      Math.max(b.target - b.current, 0) -
      Math.max(a.target - a.current, 0)
  )[0];

  const depthStyle = (depth) => {
    if (depth === "MASTER") {
      return "bg-black text-white";
    }

    if (depth === "AI-AUGMENT") {
      return "bg-[#5146e5] text-white";
    }

    return "bg-gray-100 text-gray-700";
  };

  const typeStyle = (type) => {
    if (type === "Human-Core") {
      return "bg-green-50 text-green-600 border border-green-200";
    }

    if (type === "AI-Augmented") {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }

    return "bg-red-50 text-red-500 border border-red-200";
  };

  const getPhaseTitle = () => {
    if (activePhase === 1) {
      return "Phase 1 · Master the Core";
    }

    if (activePhase === 2) {
      return "Phase 2 · Augment with AI";
    }

    return "Phase 3 · Awareness & Ship";
  };

  const getPhaseDescription = () => {
    if (activePhase === 1) {
      return "Focus on Human-Core skills where deep reasoning and expertise compound.";
    }

    if (activePhase === 2) {
      return "Build functional strength in AI-Augmented skills and learn to work effectively with AI.";
    }

    return "Gain minimum viable exposure to automated skills, then focus on shipping your portfolio.";
  };

  const getPhaseDays = () => {
    if (activePhase === 1) {
      return "DAYS 1–30";
    }

    if (activePhase === 2) {
      return "DAYS 31–60";
    }

    return "DAYS 61–90";
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#171717]">
      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-[1180px] px-6 py-10">

        {/* ================= HEADER ================= */}
        <div className="mb-7">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5146e5]">
            Step 5 of 5 — Your Plan
          </p>

          <h1 className="font-serif text-[42px] font-bold leading-tight">
            Your 90-Day FutureProof Roadmap
          </h1>

          <p className="mt-3 text-[15px] text-gray-500">
            Sequenced by depth, not alphabet. Master-depth skills first,
            awareness-level last.
          </p>

          <p className="mt-2 text-[12px] text-gray-400">
            Personalized for{" "}
            <span className="font-semibold text-gray-700">
              {userProfile?.role || "your target role"}
            </span>
          </p>
        </div>

        {/* ================= SUMMARY BAR ================= */}
        <div className="mb-8 flex items-center gap-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers3
              size={16}
              className="text-[#5146e5]"
            />

            <span className="text-[11px] font-bold tracking-wider">
              DEPTH-FIRST BY DESIGN
            </span>
          </div>

          <div className="h-5 w-px bg-gray-200" />

          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {masterCount}
            </span>{" "}
            Master
          </div>

          <div className="text-gray-300">•</div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold text-[#5146e5]">
              {augmentCount}
            </span>{" "}
            AI-Augment
          </div>

          <div className="text-gray-300">•</div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">
              {awarenessCount}
            </span>{" "}
            Basic-Awareness
          </div>

          <div className="text-gray-300">•</div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">
              ~{totalHours}h
            </span>{" "}
            total
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="grid grid-cols-[200px_1fr] gap-8">

          {/* ================= SIDEBAR ================= */}
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-4 text-[11px] font-semibold tracking-[0.15em] text-gray-500">
              PLAN PHASES
            </p>

            <div className="space-y-1">
              {phases.map((phase) => (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                    activePhase === phase.id
                      ? "bg-[#5146e5] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {phase.title}
                    </div>

                    <div
                      className={`mt-1 text-[11px] ${
                        activePhase === phase.id
                          ? "text-white/80"
                          : "text-gray-400"
                      }`}
                    >
                      {phase.days}
                    </div>
                  </div>

                  <ChevronRight size={15} />
                </button>
              ))}
            </div>

            {/* ================= PROGRESS ================= */}
            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">
                  Completed
                </span>

                <span className="font-semibold text-green-500">
                  0 / {allSkills.length}
                </span>
              </div>

              <div className="mb-3 flex justify-between text-sm">
                <span className="text-gray-500">
                  In progress
                </span>

                <span className="font-semibold">
                  {allSkills.filter(
                    (skill) => skill.current > 0 && skill.current < skill.target
                  ).length}
                </span>
              </div>

              <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#5146e5] transition-all duration-500"
                  style={{
                    width: `${
                      allSkills.length
                        ? Math.round(
                            (allSkills.filter(
                              (skill) => skill.current >= skill.target
                            ).length /
                              allSkills.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  window.print()
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#202020] py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                <Download size={14} />
                Export Plan
              </button>
            </div>
          </aside>

          {/* ================= ROADMAP CONTENT ================= */}
          <section>

            {/* Phase Heading */}
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-[25px] font-bold">
                  {getPhaseTitle()}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {getPhaseDescription()}
                </p>
              </div>

              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600">
                {getPhaseDays()}
              </span>
            </div>

            {/* ================= SKILL CARDS ================= */}
            <div className="space-y-3">
              {skills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    No skills in this phase yet.
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Your personalized roadmap will update as more skill data
                    becomes available.
                  </p>
                </div>
              ) : (
                skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-5 transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[15px] font-medium">
                          {skill.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold ${depthStyle(
                              skill.depth
                            )}`}
                          >
                            {skill.depth}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${typeStyle(
                              skill.type
                            )}`}
                          >
                            ● {skill.type}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] ${
                          skill.status === "Learning"
                            ? "border border-yellow-200 bg-yellow-50 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {skill.status}
                      </span>
                    </div>

                    {/* Skill details */}
                    <div className="mt-4 flex items-center gap-5 border-t border-gray-100 pt-4 text-[12px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {skill.hours}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <BookOpen size={13} />
                        {skill.resource}
                      </div>
                    </div>

                    {/* Gap indicator */}
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                        <span>
                          Current: {skill.current}%
                        </span>

                        <span>
                          Target: {skill.target}%
                        </span>
                      </div>

                      <div className="relative h-1.5 overflow-visible rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gray-900 transition-all duration-500"
                          style={{
                            width: `${Math.min(skill.current, 100)}%`,
                          }}
                        />

                        <div
                          className="absolute top-[-3px] h-3 w-[2px] bg-[#5146e5]"
                          style={{
                            left: `${Math.min(skill.target, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ================= WHY THIS ORDER ================= */}
            {biggestGapSkill && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-[#f3f2ef] px-5 py-4">
                <p className="text-[12px] text-gray-600">
                  <span className="font-semibold text-gray-900">
                    Why this order:
                  </span>{" "}
                  {biggestGapSkill.name} currently has the largest learning
                  gap ({Math.max(
                    biggestGapSkill.target -
                      biggestGapSkill.current,
                    0
                  )}
                  points). It is prioritized according to the{" "}
                  <span className="font-semibold text-gray-900">
                    {biggestGapSkill.depth}
                  </span>{" "}
                  depth call.
                </p>
              </div>
            )}

            {/* ================= FOOTER ================= */}
            <div className="mt-7 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-green-500"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Keep building your depth
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Complete each skill to update your roadmap progress.
                  </p>
                </div>
              </div>

              <Link
                to="/skill-gap"
                className="flex items-center gap-1 text-sm font-semibold text-[#5146e5]"
              >
                View Skill Gap
                <ChevronRight size={15} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   HELPER FUNCTIONS
============================================================ */

function getHours(skill) {
  const gap = Math.max(skill.target - skill.current, 0);

  if (skill.depth === "MASTER") {
    return `${Math.max(3, Math.round(gap * 0.08))}h / week`;
  }

  if (skill.depth === "AI-AUGMENT") {
    return `${Math.max(2, Math.round(gap * 0.05))}h / week`;
  }

  return `${Math.max(1, Math.round(gap * 0.03))}h / week`;
}

function getResource(skill) {
  const resourceMap = {
    "SQL & Data Modeling": "Mode SQL Advanced",
    "Experiment Design": "Causal Inference course",
    "Statistical Reasoning": "StatQuest + paper club",
    Python: "Copilot-paired projects",
    "Data Visualization": "Storytelling with Data",
    "Prompt Engineering": "Agent workflow drills",
    "ML Ops": "Overview primer only",
    "Dashboard Reporting": "Agent-built dashboards",
  };

  return resourceMap[skill.name] || "Curated learning resources";
}

function getStatus(skill) {
  if (skill.current >= skill.target) {
    return "Ready";
  }

  if (skill.current > 0) {
    return "Learning";
  }

  return "Not Started";
}

export default RoadmapPage;