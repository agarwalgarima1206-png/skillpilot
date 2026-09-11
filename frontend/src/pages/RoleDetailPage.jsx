import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getRole } from "../services/api";

const tierStyles = {
  "Human-Core":
    "border-green-200 bg-green-50 text-green-700",
  "AI-Augmented":
    "border-yellow-200 bg-yellow-50 text-yellow-700",
  "AI-Accelerated":
    "border-red-200 bg-red-50 text-red-600",
};

export default function RoleDetailPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setRole(null);

    getRole(roleId)
      .then(setRole)
      .catch((e) => setError(e.message));
  }, [roleId]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-10">
        <p className="text-red-600">{error}</p>

        <Link
          to="/explore"
          className="mt-4 inline-flex items-center gap-2 text-indigo-600"
        >
          <ArrowLeft size={15} />
          Back to roles
        </Link>
      </main>
    );
  }

  if (!role) {
    return (
      <main className="mx-auto max-w-5xl p-10 text-sm text-gray-500">
        Loading role…
      </main>
    );
  }

  const startAssessment = () => {
    navigate(`/chat?role=${role.id}`);
  };

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* Back */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={15} />
          All roles
        </Link>

        {/* Hero */}
        <section className="mt-7 grid gap-8 md:grid-cols-[1fr_340px]">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              {role.onet_soc_code} · O*NET evidence
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-gray-950">
              {role.title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
              {role.description}
            </p>

            {/* What the role does */}
            <h2 className="mt-10 font-serif text-2xl font-bold text-gray-950">
              What the role does
            </h2>

            <ul className="mt-4 space-y-3">
              {role.responsibilities?.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Assessment card */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              SkillPilot assessment
            </p>

            <h2 className="mt-3 font-serif text-xl font-bold text-gray-950">
              Find your actual skill gap
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              SkillPilot will ask you a few questions about your current
              knowledge and experience before generating your personalized
              skill gap.
            </p>

            <div className="mt-5 space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600" />
                Assess your current skills
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600" />
                Identify AI impact on each skill
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600" />
                Generate your learning depth
              </div>
            </div>

            <button
              onClick={startAssessment}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Calibrate my skills
              <ArrowRight size={15} />
            </button>
          </aside>
        </section>

        {/* Skill Depth */}
        <section className="mt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-950">
                Skill depth map
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Not every skill needs the same learning investment.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {role.skills?.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {skill.name}
                  </h3>

                  <span
                    className={`rounded-full border px-2 py-1 text-[9px] font-bold ${
                      tierStyles[skill.tier] ||
                      "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    {skill.tier}
                  </span>
                </div>

                <div className="mt-3 inline-block rounded bg-gray-900 px-2 py-1 text-[10px] font-bold text-white">
                  {skill.depth}
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  {skill.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-12 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-950">
                Ready to see where you stand?
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Start the AI assessment and get a personalized learning path.
              </p>
            </div>

            <button
              onClick={startAssessment}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Start assessment
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
