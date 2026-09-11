import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Gauge,
  Route,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const depthExamples = [
  {
    skill: "Experiment Design",
    tier: "Human-Core",
    depth: "MASTER",
    note: "Build strong independent expertise",
  },
  {
    skill: "Python & Programming",
    tier: "AI-Augmented",
    depth: "AI-AUGMENT",
    note: "Learn deeply and use AI to accelerate work",
  },
  {
    skill: "Routine Reporting",
    tier: "AI-Accelerated",
    depth: "BASIC-AWARENESS",
    note: "Understand the process and supervise AI output",
  },
];

const features = [
  {
    icon: Brain,
    number: "01",
    title: "Calibrate your skills",
    text: "A short guided AI conversation turns your current knowledge and experience into measurable skill signals.",
  },
  {
    icon: Gauge,
    number: "02",
    title: "Find the real gaps",
    text: "Compare your current level with the depth your target role actually requires.",
  },
  {
    icon: Route,
    number: "03",
    title: "Build your roadmap",
    text: "Get a focused learning plan based on your gaps instead of a generic list of courses.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-950">

      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">

          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-xl font-bold"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles size={16} />
            </span>
            SkillPilot
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <Link
              to="/explore"
              className="text-gray-600 transition hover:text-gray-950"
            >
              Explore roles
            </Link>

            <Link
              to="/auth"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main>

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-gray-200">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">

            {/* Hero copy */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                <Sparkles size={13} />
                AI-era career intelligence
              </div>

              <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Know what to learn.
                <br />
                <span className="text-indigo-600">
                  Know how deep.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
                SkillPilot compares your current abilities with real
                occupation data and determines how deeply each skill is worth
                learning in an AI-driven workplace.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/explore"
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                >
                  Explore your career
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/explore"
                  className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                >
                  Browse roles
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-indigo-600" />
                  Real occupation data
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-indigo-600" />
                  AI impact analysis
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-indigo-600" />
                  Personalized roadmap
                </span>
              </div>
            </div>

            {/* Depth recommendation card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">

              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Example analysis
                  </p>

                  <h2 className="mt-1 text-sm font-bold text-gray-900">
                    Recommended learning depth
                  </h2>
                </div>

                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Data Scientist
                </span>
              </div>

              <div className="space-y-1">
                {depthExamples.map((item) => (
                  <div
                    key={item.skill}
                    className="border-b border-gray-100 py-4 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.skill}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.tier}
                        </p>
                      </div>

                      <span className="shrink-0 rounded bg-gray-900 px-2 py-1 text-[10px] font-bold text-white">
                        {item.depth}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-500">
                The goal isn't to learn everything equally. SkillPilot helps
                you invest your time where it matters most.
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-5 py-14">

          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              How SkillPilot works
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight">
              From career goal to focused learning plan.
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Instead of giving every learner the same checklist, SkillPilot
              adapts the learning depth to the role and the impact of AI.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, number, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Icon size={23} className="text-indigo-600" />

                <p className="mt-6 text-xs font-semibold text-gray-400">
                  {number}
                </p>

                <h3 className="mt-1 font-serif text-xl font-bold">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Differentiator */}
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                The key difference
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold">
                Not just “what skills?”
                <br />
                <span className="text-indigo-600">
                  But “how deeply?”
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                AI is changing how different skills are used. Some skills
                require deep human expertise, some should be learned alongside
                AI, and others only need enough understanding to supervise
                AI-assisted work.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-6">
              <div className="grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-bold text-green-700">
                    HUMAN-CORE
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Master
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Deep expertise remains essential.
                  </p>
                </div>

                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-xs font-bold text-yellow-700">
                    AI-AUGMENTED
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    AI-Augment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Combine human skill with AI.
                  </p>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-bold text-red-600">
                    AI-ACCELERATED
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Basic Awareness
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Understand and supervise AI output.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="rounded-2xl bg-indigo-600 px-7 py-10 text-center text-white md:px-12">

            <h2 className="font-serif text-3xl font-bold">
              Ready to find your skill gaps?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-indigo-100">
              Choose a target role, complete a short AI assessment, and get a
              roadmap built around the skills that matter most.
            </p>

            <Link
              to="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              Start with a role
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}