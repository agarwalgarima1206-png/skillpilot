import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  GitBranch,
  RefreshCw,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";

import {
  adaptRoadmap,
  createRoadmap,
  getCurrentRoadmap,
  updateRoadmapProgress,
} from "../services/api";

import { useUser } from "../context/UserContext";

export default function RoadmapPage() {
  const { updateUser } = useUser();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(3);
  const [goal, setGoal] = useState("Job Ready");
  const [hours, setHours] = useState(8);

  const [showAdapt, setShowAdapt] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const [saving, setSaving] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD CURRENT ROADMAP
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadRoadmap = async () => {
      try {
        setError("");

        const roadmap = await getCurrentRoadmap();

        if (!mounted) return;

        setData(roadmap);
        setDuration(roadmap.duration_months ?? 3);
        setGoal(roadmap.goal ?? "Job Ready");
        setHours(roadmap.weekly_hours ?? 8);

        // Save the active assessment/session in UserContext.
        if (updateUser && roadmap.assessment_id) {
          updateUser({
            sessionId: roadmap.assessment_id,
          });
        }
      } catch (e) {
        if (mounted) {
          setError(e.message || "Failed to load roadmap.");
        }
      }
    };

    loadRoadmap();

    return () => {
      mounted = false;
    };
  }, [updateUser]);

  // ============================================================
  // ALL TASKS + OVERALL PROGRESS
  // ============================================================

  const allTasks = useMemo(() => {
    return (
      data?.phases?.flatMap((phase) =>
        (phase.skills || []).flatMap((skill) => skill.tasks || [])
      ) || []
    );
  }, [data]);

  const completed = allTasks.filter((task) => task.done).length;

  const progress = allTasks.length
    ? Math.round((completed / allTasks.length) * 100)
    : 0;

  // ============================================================
  // REGENERATE / CUSTOMIZE ROADMAP
  // ============================================================

  const regenerate = async () => {
    if (!data?.assessment_id || saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const roadmap = await createRoadmap(data.assessment_id, {
        duration_months: Number(duration),
        goal,
        weekly_hours: Number(hours),
      });

      setData({
        ...roadmap,
        assessment_id: data.assessment_id,
      });
      setSuccess("Roadmap updated successfully.");
    } catch (e) {
      setError(e.message || "Failed to update roadmap.");
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ADAPT ROADMAP
  // ============================================================

  const adapt = async () => {
    if (!data?.assessment_id || !reason || saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const roadmap = await adaptRoadmap(data.assessment_id, {
        reason,
        details,
      });

      setData({
        ...roadmap,
        assessment_id: data.assessment_id,
      });

      setShowAdapt(false);
      setReason("");
      setDetails("");
      setSuccess("Roadmap adapted successfully.");
    } catch (e) {
      setError(e.message || "Failed to adapt roadmap.");
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // TOGGLE TASK PROGRESS
  // ============================================================

  const toggle = async (task) => {
    if (!data?.assessment_id || progressSaving) return;

    const nextDone = !task.done;

    try {
      setProgressSaving(true);
      setError("");

      const updatedRoadmap = await updateRoadmapProgress(
        data.assessment_id,
        task.id,
        nextDone
      );

      setData({
        ...updatedRoadmap,
        assessment_id: data.assessment_id,
      });
    } catch (e) {
      setError(e.message || "Failed to update task progress.");
    } finally {
      setProgressSaving(false);
    }
  };

  // ============================================================
  // ERROR SCREEN
  // ============================================================

  if (error && !data) {
    return (
      <main className="mx-auto max-w-5xl p-10">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="font-serif text-2xl font-bold">
            Roadmap unavailable
          </h1>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            onClick={() => nav("/chat")}
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start assessment
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (!data) {
    return (
      <main className="min-h-[calc(100vh-68px)] bg-[#fafafa] p-10">
        <p className="text-sm text-gray-500">
          Loading your saved roadmap…
        </p>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]">
      <div className="mx-auto max-w-7xl px-5 py-10">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
              YOUR LEARNING JOURNEY
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold">
              Your {data.duration_months}-month roadmap
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {data.role} · {data.goal} · {data.weekly_hours} hrs/week
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAdapt(true)}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
            >
              <MessageSquareText size={15} />
              Adapt roadmap
            </button>

            <button
              onClick={() => nav("/skill-gap")}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Reassess
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ======================================================
            ERROR BANNER
        ======================================================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && !error && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* ======================================================
            PROGRESS + ROADMAP DESIGN
        ======================================================= */}

        <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_320px]">

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Overall progress
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {progress}%
                  <span className="text-sm font-normal text-gray-400">
                    {" "}
                    · {completed}/{allTasks.length} tasks
                  </span>
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="h-3 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-indigo-50 p-5">
            <p className="text-xs font-bold text-indigo-700">
              Roadmap design
            </p>

            <p className="mt-2 text-sm leading-6 text-indigo-900/70">
              Follow the flow from foundation → applied skills → proof of
              work. Resources sit inside every skill node.
            </p>
          </section>
        </div>

        {/* ======================================================
            PLAN CONTROLS
        ======================================================= */}

        <div className="mt-4 rounded-2xl border bg-white p-5">
          <div className="flex flex-wrap items-center gap-4">

            <div className="flex items-center gap-2 text-xs font-semibold">
              <CalendarDays size={15} className="text-indigo-600" />
              Duration
            </div>

            {[3, 6, 9, 12].map((x) => (
              <button
                key={x}
                onClick={() => setDuration(x)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${duration === x
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {x} months
              </button>
            ))}

            <input
              type="number"
              min="1"
              max="24"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={saving}
              className="w-24 rounded-full border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:bg-gray-50"
            />

            <span className="text-[10px] text-gray-400">
              Custom months
            </span>

            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={saving}
              className="rounded-full border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option>Job Ready</option>
              <option>Internship</option>
              <option>Placement / Interview</option>
              <option>Deep Mastery</option>
              <option>Portfolio</option>
            </select>

            <label className="text-xs font-semibold">
              {hours}h/week

              <input
                type="range"
                min="1"
                max="40"
                value={hours}
                onChange={(e) => {
                  setHours(Number(e.target.value));
                  setSuccess("");
                }}
                disabled={saving}
                className="ml-2 align-middle disabled:opacity-50"
              />
            </label>

            <button
              onClick={regenerate}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Updating…" : "Apply plan"}
            </button>
          </div>
        </div>

        {/* ======================================================
            ROADMAP FLOW
        ======================================================= */}

        <div className="mt-8 overflow-x-auto pb-4">
          <div className="min-w-[900px]">

            {/* TARGET */}

            <div className="mb-7 flex items-center justify-center">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-8 py-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                  TARGET
                </p>

                <p className="mt-1 font-serif text-xl font-bold">
                  {data.role} · {data.goal}
                </p>
              </div>
            </div>

            <div className="mx-auto h-8 w-px bg-gray-300" />

            <div className="relative grid grid-cols-3 gap-6">

              {data.phases.map((phase, index) => (
                <div
                  key={phase.phase_number}
                  className="relative"
                >

                  {index < data.phases.length - 1 && (
                    <div className="absolute right-[-24px] top-10 z-0 h-px w-12 bg-gray-300" />
                  )}

                  <div className="relative z-10 rounded-2xl border bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold">
                        PHASE {phase.phase_number}
                      </span>

                      <GitBranch
                        size={15}
                        className="text-indigo-500"
                      />
                    </div>

                    <h2 className="mt-3 font-serif text-xl font-bold">
                      {phase.title}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Days {phase.days}
                    </p>

                    <div className="mt-4 space-y-2">

                      {(phase.skills || []).map((skill) => {
                        const skillTasks = skill.tasks || [];

                        const skillCompleted = skillTasks.filter(
                          (task) => task.done
                        ).length;

                        const skillProgress = skillTasks.length
                          ? Math.round(
                            (skillCompleted / skillTasks.length) * 100
                          )
                          : 0;

                        return (
                          <div
                            key={skill.name}
                            className="rounded-xl bg-gray-50 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold">
                                {skill.name}
                              </p>

                              <span className="text-[10px] text-gray-400">
                                {skill.hours_per_week}h/w
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{
                                  width: `${skillProgress}%`,
                                }}
                              />
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">
                                {skillCompleted}/{skillTasks.length} tasks
                              </span>

                              {skill.resource_url && (
                                <a
                                  href={skill.resource_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600"
                                >
                                  <BookOpen size={11} />
                                  {skill.resource}
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* ======================================================
            DETAILED PHASES + TASK CHECKBOXES
        ======================================================= */}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">

          {data.phases.map((phase) => (
            <section
              key={phase.phase_number}
              className="rounded-2xl border bg-white p-5"
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                    Phase {phase.phase_number}
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-bold">
                    {phase.title}
                  </h2>
                </div>

                <span className="text-xs text-gray-400">
                  Days {phase.days}
                </span>
              </div>

              <div className="mt-4 space-y-4">

                {(phase.skills || []).map((skill) => (
                  <article
                    key={skill.name}
                    className="rounded-xl border p-4"
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <h3 className="text-sm font-semibold">
                          {skill.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {skill.tier} · {skill.hours_per_week}h/week
                        </p>
                      </div>

                    </div>

                    {/* TASK LIST */}

                    <div className="mt-3 space-y-1">

                      {(skill.tasks || []).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => toggle(task)}
                          disabled={progressSaving}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {task.done ? (
                            <CheckCircle2
                              size={15}
                              className="shrink-0 text-indigo-600"
                            />
                          ) : (
                            <Circle
                              size={15}
                              className="shrink-0 text-gray-300"
                            />
                          )}

                          <span
                            className={
                              task.done
                                ? "text-gray-400 line-through"
                                : "text-gray-700"
                            }
                          >
                            {task.title}
                          </span>
                        </button>
                      ))}

                    </div>

                    {skill.resource_url && (
                      <a
                        href={skill.resource_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600"
                      >
                        <BookOpen size={13} />
                        {skill.resource}
                      </a>
                    )}

                  </article>
                ))}

              </div>
            </section>
          ))}

        </div>

        {/* ======================================================
            ADAPT ROADMAP MODAL
        ======================================================= */}

        {showAdapt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">

            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    ADAPT ROADMAP
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-bold">
                    Tell SkillPilot what changed
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setShowAdapt(false);
                    setReason("");
                    setDetails("");
                  }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  ✕
                </button>

              </div>

              <div className="mt-5 grid gap-2">

                {[
                  "I have less time now",
                  "I have more time now",
                  "I am struggling with a skill",
                  "I already know some topics",
                  "I want more projects",
                  "My career goal changed",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => setReason(option)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${reason === option
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50"
                      }`}
                  >
                    {option}
                  </button>
                ))}

              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="For example: I have exams for the next month, so I can only study 4 hours/week. After that I can return to 10 hours."
                className="mt-4 min-h-28 w-full rounded-xl border p-3 text-sm outline-none focus:border-indigo-500"
              />

              <p className="mt-2 text-[10px] text-gray-400">
                The AI can translate your situation into a new duration,
                weekly load and goal. Your completed tasks are preserved.
              </p>

              <div className="mt-4 flex justify-end gap-2">

                <button
                  onClick={() => {
                    setShowAdapt(false);
                    setReason("");
                    setDetails("");
                  }}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  disabled={!reason || saving}
                  onClick={adapt}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
                >
                  {saving ? "Rebuilding…" : "Rebuild roadmap"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
