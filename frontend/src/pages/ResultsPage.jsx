import { Link } from "react-router-dom";
import {
  ArrowRight,
  CircleHelp,
} from "lucide-react";
import { useUser } from "../context/UserContext";

function ResultsPage() {
  const { userProfile } = useUser();

  // Skills now come from shared UserContext
  const skills = userProfile.skills;

  // Calculate overall score from current skill levels
  const score =
    skills.length > 0
      ? Math.round(
          skills.reduce((sum, skill) => sum + skill.current, 0) /
            skills.length
        )
      : 0;

  // Calculate summary stats
  const atOrAboveTarget = skills.filter(
    (skill) => skill.current >= skill.target
  ).length;

  const needRealDepth = skills.filter(
    (skill) => skill.current < skill.target
  ).length;

  const alreadyPastTarget = skills.filter(
    (skill) => skill.current > skill.target
  ).length;

  // Find biggest learning gap
  const biggestGapSkill = skills.reduce(
    (biggest, skill) => {
      const currentGap = Math.max(skill.target - skill.current, 0);
      const biggestGap = Math.max(
        biggest.target - biggest.current,
        0
      );

      return currentGap > biggestGap ? skill : biggest;
    },
    skills[0] || {
      name: "No skill data",
      depth: "MASTER",
      current: 0,
      target: 0,
    }
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1100px] px-5 pb-9 pt-10">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600">
            STEP 4 OF 5 — YOUR RESULTS
          </p>

          <h1 className="font-serif text-[38px] font-bold leading-tight tracking-tight text-gray-950">
            Your Skill Gap Analysis
          </h1>

          <p className="mt-3 max-w-[720px] text-[13px] leading-5 text-gray-500">
            Calibrated against the{" "}
            <span className="font-semibold text-gray-800">
              {userProfile.role}
            </span>{" "}
            role. The indigo marker on each bar is the{" "}
            <span className="font-semibold text-gray-800">
              role&apos;s target
            </span>{" "}
            — and every gap is graded by{" "}
            <span className="font-semibold text-gray-800">
              how deep it&apos;s worth going.
            </span>
          </p>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1100px] px-5 py-9">
          <div className="grid grid-cols-[260px_1fr] gap-5">

            {/* ================= LEFT COLUMN ================= */}
            <div>

              {/* Score Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-500">
                  <CircleHelp
                    size={13}
                    className="text-indigo-600"
                  />
                  FUTUREPROOF SCORE
                </div>

                <div className="mt-3 flex items-end gap-2">
                  <span className="font-serif text-[46px] leading-none">
                    {score}
                  </span>

                  <span className="mb-1 text-[12px] text-gray-500">
                    / 100
                  </span>
                </div>

                {/* Score bar */}
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(score, 100)}%`,
                    }}
                  />
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-gray-100 px-2 py-3 text-center">
                    <div className="font-serif text-[20px] font-bold">
                      {atOrAboveTarget}
                    </div>

                    <div className="mt-1 text-[8px] leading-3 text-gray-500">
                      at or above
                      <br />
                      target
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-100 px-2 py-3 text-center">
                    <div className="font-serif text-[20px] font-bold">
                      {needRealDepth}
                    </div>

                    <div className="mt-1 text-[8px] leading-3 text-gray-500">
                      need real
                      <br />
                      depth
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-100 px-2 py-3 text-center">
                    <div className="font-serif text-[20px] font-bold">
                      {alreadyPastTarget}
                    </div>

                    <div className="mt-1 text-[8px] leading-3 text-gray-500">
                      already past
                      <br />
                      target
                    </div>
                  </div>
                </div>
              </div>

              {/* Depth Legend */}
              <div className="mt-5 rounded-xl border border-dashed border-indigo-300 bg-white p-5">
                <h3 className="text-[11px] font-bold tracking-wider text-gray-700">
                  DEPTH LEGEND
                </h3>

                <div className="mt-4 space-y-4">
                  <LegendItem
                    label="MASTER"
                    description="Close the full gap. This is where your career compounds."
                    type="master"
                  />

                  <LegendItem
                    label="AI-AUGMENT"
                    description="Reach functional strength — AI covers the rest."
                    type="augment"
                  />

                  <LegendItem
                    label="BASIC-AWARENESS"
                    description="Aim low on purpose. Know it exists and supervise."
                    type="basic"
                  />
                </div>

                <div className="mt-5 border-t border-gray-200 pt-4 text-[9px] text-gray-400">
                  ⓘ Bars: dark fill = you, indigo tick = role target.
                </div>
              </div>

            </div>

            {/* ================= RIGHT COLUMN ================= */}
            <div className="rounded-xl border border-gray-200 bg-white">

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_210px] items-center border-b border-gray-200 px-5 py-4 text-[9px] font-bold tracking-widest text-gray-400">
                <span>SKILL</span>
                <span>DEPTH CALL</span>
                <span>YOU VS ROLE TARGET</span>
              </div>

              {/* Skills */}
              {skills.map((skill) => (
                <SkillRow
                  key={skill.name}
                  skill={skill}
                />
              ))}

              {/* Bottom CTA */}
              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
                <p className="text-[10px] text-gray-500">
                  Biggest lever:{" "}
                  <span className="font-semibold text-gray-900">
                    {biggestGapSkill.name}
                  </span>{" "}
                  — a {biggestGapSkill.depth} skill at{" "}
                  {biggestGapSkill.current}% of target.
                </p>

                <Link
                  to="/roadmap"
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[10px] font-semibold text-white transition hover:bg-indigo-700"
                >
                  Build My 90-Day Roadmap
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   SKILL ROW
============================================================ */

function SkillRow({ skill }) {
  const current = Math.min(skill.current, 100);
  const target = Math.min(skill.target, 100);

  return (
    <div className="grid grid-cols-[1fr_120px_210px] items-center border-b border-gray-100 px-5 py-4">

      {/* Skill */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-gray-900">
            {skill.name}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${
              skill.impactType === "human"
                ? "bg-green-100 text-green-700"
                : skill.impactType === "accelerated"
                ? "bg-red-100 text-red-600"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            ● {skill.impact}
          </span>
        </div>
      </div>

      {/* Depth */}
      <div>
        <span
          className={`inline-block rounded-md px-2 py-1 text-[8px] font-bold ${
            skill.depth === "MASTER"
              ? "bg-gray-900 text-white"
              : skill.depth === "AI-AUGMENT"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {skill.depth}
        </span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="relative h-2 w-[110px] rounded-full bg-gray-200">

          {/* Current */}
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-gray-900 transition-all duration-500"
            style={{
              width: `${current}%`,
            }}
          />

          {/* Target marker */}
          <div
            className="absolute top-[-4px] h-4 w-[2px] bg-indigo-600"
            style={{
              left: `${target}%`,
            }}
          />
        </div>

        <span className="whitespace-nowrap text-[9px] font-medium text-gray-700">
          {skill.current}% / {skill.target}%
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   LEGEND ITEM
============================================================ */

function LegendItem({ label, description, type }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={`mt-0.5 whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-bold ${
          type === "master"
            ? "bg-gray-900 text-white"
            : type === "augment"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {label}
      </span>

      <p className="text-[9px] leading-4 text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default ResultsPage;