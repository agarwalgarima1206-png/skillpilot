import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Palette,
  Map,
  Target,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import {
  getAnalyses,
  getCurrentRoadmap,
  getCurrentSkillGap,
  getRoles,
} from "../services/api";

import { useUser } from "../context/UserContext";

const icons = {
  "Data Scientist": BarChart3,
  "Software Developer": Code2,
  "UI/UX Designer (Web & Digital Interface Designer)": Palette,
  "UI/UX Designer": Palette,
};

export default function ExplorePage() {
  const { updateUser } = useUser();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningUser, setReturningUser] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [skillGap, setSkillGap] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------
        // ALWAYS LOAD ALL ROLES
        // --------------------------------------------------

        const rolesData = await getRoles();

        if (!mounted) return;

        setRoles(Array.isArray(rolesData) ? rolesData : []);

        // --------------------------------------------------
        // CHECK PREVIOUS ASSESSMENTS
        // --------------------------------------------------

        let analyses = [];

        try {
          const result = await getAnalyses();

          analyses = Array.isArray(result)
            ? result
            : result?.analyses || [];
        } catch {
          analyses = [];
        }

        if (!mounted) return;

        // Get the latest completed assessment
        const completedAnalyses = analyses.filter(
          (item) =>
            item.status === "complete" ||
            item.status === "completed"
        );

        const completedAnalysis = completedAnalyses.sort(
          (a, b) =>
            new Date(b.updated_at || 0) -
            new Date(a.updated_at || 0)
        )[0];

        // --------------------------------------------------
        // NEW USER
        // --------------------------------------------------

        if (!completedAnalysis) {
          setReturningUser(false);
          setLoading(false);
          return;
        }

        // --------------------------------------------------
        // RETURNING USER
        // --------------------------------------------------

        setReturningUser(true);

        const sessionId =
          completedAnalysis.session_id || null;

        if (sessionId) {
          updateUser({
            sessionId,
          });
        }

        // --------------------------------------------------
        // LOAD CURRENT ROADMAP + SKILL GAP
        // --------------------------------------------------

        const [roadmapResult, skillGapResult] =
          await Promise.allSettled([
            getCurrentRoadmap(),
            getCurrentSkillGap(),
          ]);

        if (!mounted) return;

        if (roadmapResult.status === "fulfilled") {
          setRoadmap(roadmapResult.value);
        }

        if (skillGapResult.status === "fulfilled") {
          setSkillGap(skillGapResult.value);
        }

        setLoading(false);
      } catch (e) {
        if (!mounted) return;

        setError(
          e.message || "Failed to load Explore page."
        );

        setLoading(false);
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, [updateUser]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-gray-800">
              Loading your SkillPilot workspace…
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Preparing your career paths and saved progress.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // CALCULATE ROADMAP PROGRESS
  // --------------------------------------------------

  const allTasks =
    roadmap?.phases?.flatMap((phase) =>
      (phase.skills || []).flatMap(
        (skill) => skill.tasks || []
      )
    ) || [];

  const completedTasks = allTasks.filter(
    (task) => task.done
  ).length;

  const roadmapProgress = allTasks.length
    ? Math.round(
        (completedTasks / allTasks.length) * 100
      )
    : 0;

  // --------------------------------------------------
  // CURRENT ROLE
  // --------------------------------------------------

  const currentRole =
    roadmap?.role ||
    skillGap?.role ||
    null;

  const currentRoleId =
    roadmap?.role_id ||
    skillGap?.role_id ||
    null;

  // --------------------------------------------------
  // AI RESILIENCE
  // --------------------------------------------------

  const resilienceScore =
    skillGap?.ai_resilience_score ??
    skillGap?.resilience_score ??
    roadmap?.ai_resilience_score ??
    null;

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]">

      {/* ==================================================
          RETURNING USER SUMMARY
      ================================================== */}

      {returningUser && (
        <>
          <section className="border-b bg-white">
            <div className="mx-auto max-w-6xl px-5 py-10">

              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
                WELCOME BACK
              </p>

              <h1 className="mt-3 font-serif text-4xl font-bold text-gray-950">
                Continue your SkillPilot journey.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Your previous assessment and learning progress are
                saved. Continue your current path or explore another
                career direction.
              </p>

            </div>
          </section>

          {/* Summary cards */}
          <section className="mx-auto max-w-6xl px-5 pt-8">

            <div className="grid gap-4 md:grid-cols-3">

              {/* Current role */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Target size={19} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      CURRENT ROLE
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {currentRole || "Not available"}
                    </p>
                  </div>

                </div>
              </div>

              {/* AI resilience */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <TrendingUp size={19} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      AI RESILIENCE
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {resilienceScore != null
                        ? `${resilienceScore}/100`
                        : "—"}
                    </p>
                  </div>

                </div>
              </div>

              {/* Roadmap progress */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Map size={19} />
                  </div>

                  <div className="w-full">

                    <div className="flex items-center justify-between">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        ROADMAP PROGRESS
                      </p>

                      <span className="text-xs font-semibold text-indigo-600">
                        {roadmapProgress}%
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{
                          width: `${roadmapProgress}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-gray-400">
                      {completedTasks}/{allTasks.length} tasks completed
                    </p>

                  </div>
                </div>
              </div>

            </div>

            {/* Current path */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-5">

                <div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-green-600"
                    />

                    <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                      CURRENT LEARNING PATH
                    </p>
                  </div>

                  <h2 className="mt-2 font-serif text-2xl font-bold text-gray-950">
                    {currentRole || "Your career path"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {roadmap?.weekly_hours
                      ? `${roadmap.weekly_hours} hours/week`
                      : "Personalized learning plan"}

                    {roadmap?.duration_months
                      ? ` · ${roadmap.duration_months}-month roadmap`
                      : ""}
                  </p>

                </div>

                <div className="flex flex-wrap gap-2">

                  <Link
                    to="/roadmap"
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Continue Roadmap
                    <ArrowRight size={15} />
                  </Link>

                  <Link
                    to="/skill-gap"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    View Skill Gap
                  </Link>

                </div>

              </div>

            </div>
          </section>
        </>
      )}

      {/* ==================================================
          ROLE EXPLORATION
      ================================================== */}

      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10">

          <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
            {returningUser
              ? "EXPLORE OTHER CAREER PATHS"
              : "STEP 1 · PICK A TARGET ROLE"}
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold text-gray-950">
            {returningUser
              ? "Explore another role."
              : "Explore a role. See where AI lands."}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            {returningUser
              ? "Your current path stays saved. Explore another role to understand its skills, AI impact and recommended learning depth."
              : "Role evidence comes from the included O*NET dataset. SkillPilot then applies its depth framework to decide where deep expertise is worth the investment."}
          </p>

        </div>
      </section>

      {/* ==================================================
          ROLE CARDS
      ================================================== */}

      <section className="mx-auto max-w-6xl px-5 py-10">

        {error && (
          <div className="mb-5">
            <ErrorBox text={error} />
          </div>
        )}

        {roles.length === 0 && !error ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="font-semibold text-gray-800">
              No career roles available.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Please make sure the FastAPI backend is running.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                currentRole={currentRole}
                currentRoleId={currentRoleId}
                returningUser={returningUser}
              />
            ))}
          </div>
        )}

      </section>
    </main>
  );
}

// ============================================================
// ROLE CARD
// ============================================================

function RoleCard({
  role,
  currentRole,
  currentRoleId,
  returningUser,
}) {
  const Icon = icons[role.title] || Code2;

  const isCurrentRole =
    returningUser &&
    (
      (currentRoleId &&
        role.id === currentRoleId) ||
      (currentRole &&
        role.title?.toLowerCase() ===
          currentRole.toLowerCase())
    );

  return (
    <article className="flex min-h-[320px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-center justify-between gap-3">

        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-indigo-600">
          <Icon size={20} />
        </span>

        <div className="flex flex-wrap justify-end gap-2">

          {isCurrentRole && (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
              Current role
            </span>
          )}

          {role.impact_tag && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
              {role.impact_tag}
            </span>
          )}

        </div>
      </div>

      <h2 className="mt-6 font-serif text-2xl font-bold text-gray-950">
        {role.title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {role.description}
      </p>

      <div className="mt-auto pt-6">

        <Link
          to={`/role/${role.id}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {isCurrentRole
            ? "View current role"
            : "Explore role"}

          <ArrowRight size={15} />
        </Link>

      </div>
    </article>
  );
}

// ============================================================
// ERROR BOX
// ============================================================

function ErrorBox({ text }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      {text}

      <p className="mt-2 text-xs">
        Start the FastAPI backend on port 8000 and refresh.
      </p>
    </div>
  );
}