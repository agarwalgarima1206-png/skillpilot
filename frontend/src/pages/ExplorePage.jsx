import { BarChart3, Code2, Palette, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function ExplorePage() {
  const roles = [
    {
      id: "data-scientist",
      icon: <BarChart3 size={20} />,
      title: "Data Scientist",
      impact: "Balanced impact",
      impactType: "balanced",
      description:
        "AI automates ~40% of routine analysis — framing questions and designing experiments stay human.",
      skills: ["Python", "Statistics", "SQL", "ML Ops"],
      depth: "Highest Master-depth payoff of the three roles.",
    },

    {
      id: "software-developer",
      icon: <Code2 size={20} />,
      title: "Software Developer",
      impact: "AI-heavy role",
      impactType: "heavy",
      description:
        "Code generation handles the boilerplate — architecture, review, and system thinking become the moat.",
      skills: ["TypeScript", "System Design", "Testing", "DevOps"],
      depth: "Most tasks shift to AI-Augment, not away.",
    },

    {
      id: "ui-ux-designer",
      icon: <Palette size={20} />,
      title: "UI/UX Designer",
      impact: "Balanced impact",
      impactType: "balanced",
      description:
        "AI drafts first-pass screens — research, taste, and product judgment become the differentiator.",
      skills: ["User Research", "Figma", "Prototyping", "Design Systems"],
      depth: "Production tooling goes Basic-Awareness fast.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      
    

          

  
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1000px] px-5 pb-10 pt-10">

          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600">
            STEP 1 OF 5 — PICK A TARGET ROLE
          </p>

          <h1 className="max-w-[650px] font-serif text-[38px] font-bold leading-[1.12] tracking-tight text-gray-950">
            Explore a role. See exactly
            <br />
            where AI lands.
          </h1>

          <p className="mt-4 max-w-[620px] text-[13px] leading-5 text-gray-500">
            Each role comes with a skill-by-skill classification — and a{" "}
            <span className="font-semibold text-gray-800">
              depth recommendation
            </span>{" "}
            for every skill: Master, AI-Augment, or Basic-Awareness.
          </p>

        </div>
      </section>

      {/* ROLE CARDS */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1000px] px-5 py-10">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
              />
            ))}

          </div>

          {/* LEGEND */}
          <div className="mt-7 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-[10px]">

            <span className="font-bold tracking-widest text-gray-700">
              LEGEND
            </span>

            <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[9px] font-bold text-white">
              MASTER
            </span>

            <span className="text-gray-500">
              invest years
            </span>

            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">
              AI-AUGMENT
            </span>

            <span className="text-gray-500">
              learn to leverage AI
            </span>

            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[9px] font-bold text-gray-700">
              BASIC-AWARENESS
            </span>

            <span className="text-gray-500">
              know it exists
            </span>

            <Link
              to="/role/data-scientist"
              className="ml-auto flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
            >
              Jump to the closest match
              <ArrowRight size={12} />
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}


/* ================= ROLE CARD ================= */

function RoleCard({ role }) {
  return (
    <div className="flex min-h-[282px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* TOP */}
      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-indigo-600">
          {role.icon}
        </div>

        {role.impactType === "heavy" ? (
          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-[9px] font-medium text-yellow-700">
            — {role.impact}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-medium text-gray-500">
            — {role.impact}
          </span>
        )}

      </div>

      {/* TITLE */}
      <h2 className="mt-5 font-serif text-[19px] font-bold text-gray-900">
        {role.title}
      </h2>

      {/* DESCRIPTION */}
      <p className="mt-2 min-h-[50px] text-[11px] leading-[1.55] text-gray-500">
        {role.description}
      </p>

      {/* SKILLS */}
      <div className="mt-4 flex flex-wrap gap-1.5">

        {role.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[9px] font-medium text-gray-700"
          >
            {skill}
          </span>
        ))}

      </div>

      {/* DEPTH */}
      <div className="mt-4 rounded-lg bg-gray-100 px-3 py-2.5 text-[9px] leading-4 text-gray-500">

        <span className="font-bold text-gray-800">
          Depth-first:
        </span>{" "}

        {role.depth}

      </div>

      {/* EXPLORE BUTTON */}
      <Link
        to={`/role/${role.id}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
      >
        Explore
        <ArrowRight size={13} />
      </Link>

    </div>
  );
}

export default ExplorePage;