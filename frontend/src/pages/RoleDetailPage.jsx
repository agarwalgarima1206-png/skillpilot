import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

const roleData = {
  "data-scientist": {
    title: "Data Scientist",
    description:
      "Every skill below carries two labels: how AI will affect it, and the depth we recommend learning at.",

    responsibilities: [
      "Frame business problems as answerable data questions",
      "Design and run experiments that survive scrutiny",
      "Build and validate models against real-world messiness",
      "Translate findings into decisions leaders act on",
    ],

    humanCore: [
      {
        name: "Experiment Design",
        description: "Framing the right question is the whole job.",
        level: "MASTER",
      },
      {
        name: "Statistical Reasoning",
        description: "You must catch what the model gets wrong.",
        level: "MASTER",
      },
      {
        name: "Stakeholder Communication",
        description: "Trust is built by humans, not agents.",
        level: "MASTER",
      },
    ],

    aiAugmented: [
      {
        name: "Python",
        description: "AI writes code; you review and architect.",
        level: "AI-AUGMENT",
      },
      {
        name: "SQL & Data Modeling",
        description: "Query drafting is automated — judgment is not.",
        level: "AI-AUGMENT",
      },
      {
        name: "Data Visualization",
        description: "AI drafts charts; you choose the story.",
        level: "AI-AUGMENT",
      },
    ],

    aiAccelerated: [
      {
        name: "EDA & Reporting Dashboards",
        description: "Agents generate these from a prompt.",
        level: "BASIC-AWARENESS",
      },
      {
        name: "ML Boilerplate & Tuning",
        description: "AutoML + copilots cover most of this.",
        level: "BASIC-AWARENESS",
      },
      {
        name: "Documentation & Notes",
        description: "Fully automated in the modern stack.",
        level: "BASIC-AWARENESS",
      },
    ],
  },

  "software-developer": {
    title: "Software Developer",
    description:
      "Explore the skills that matter most for modern software development and understand where AI changes the work.",

    responsibilities: [
      "Design scalable software architectures",
      "Build reliable applications and services",
      "Review and improve AI-generated code",
      "Solve complex engineering and system problems",
    ],

    humanCore: [
      {
        name: "System Design",
        description: "Architecture and trade-offs require engineering judgment.",
        level: "MASTER",
      },
      {
        name: "Problem Solving",
        description: "Understanding the real problem remains human.",
        level: "MASTER",
      },
      {
        name: "Code Review",
        description: "You need to recognize quality and hidden issues.",
        level: "MASTER",
      },
    ],

    aiAugmented: [
      {
        name: "TypeScript",
        description: "AI can generate code; you review and structure it.",
        level: "AI-AUGMENT",
      },
      {
        name: "Testing",
        description: "AI can generate tests, but engineers validate them.",
        level: "AI-AUGMENT",
      },
      {
        name: "DevOps",
        description: "AI assists deployment and infrastructure workflows.",
        level: "AI-AUGMENT",
      },
    ],

    aiAccelerated: [
      {
        name: "Boilerplate Code",
        description: "AI can generate repetitive implementation quickly.",
        level: "BASIC-AWARENESS",
      },
      {
        name: "Basic Documentation",
        description: "AI can generate documentation from existing code.",
        level: "BASIC-AWARENESS",
      },
      {
        name: "Simple CRUD Development",
        description: "AI can handle much of the repetitive work.",
        level: "BASIC-AWARENESS",
      },
    ],
  },

  "ui-ux-designer": {
    title: "UI/UX Designer",
    description:
      "Understand which design skills remain deeply human and which parts of the workflow AI can accelerate.",

    responsibilities: [
      "Understand user needs and behavior",
      "Create intuitive user experiences",
      "Design and test interactive prototypes",
      "Make product decisions based on user research",
    ],

    humanCore: [
      {
        name: "User Research",
        description: "Understanding real users requires empathy and judgment.",
        level: "MASTER",
      },
      {
        name: "Product Judgment",
        description: "Good design requires understanding context and trade-offs.",
        level: "MASTER",
      },
      {
        name: "Design Thinking",
        description: "Framing the right problem remains deeply human.",
        level: "MASTER",
      },
    ],

    aiAugmented: [
      {
        name: "Figma",
        description: "AI can speed up parts of the design workflow.",
        level: "AI-AUGMENT",
      },
      {
        name: "Prototyping",
        description: "AI can generate first-pass prototypes quickly.",
        level: "AI-AUGMENT",
      },
      {
        name: "Design Systems",
        description: "AI can assist with repetitive design-system work.",
        level: "AI-AUGMENT",
      },
    ],

    aiAccelerated: [
      {
        name: "Basic Screen Generation",
        description: "AI can generate first-pass screens from prompts.",
        level: "BASIC-AWARENESS",
      },
      {
        name: "UI Variations",
        description: "AI can rapidly produce alternative layouts.",
        level: "BASIC-AWARENESS",
      },
      {
        name: "Design Documentation",
        description: "AI can automate much of repetitive documentation.",
        level: "BASIC-AWARENESS",
      },
    ],
  },
};

function SkillSection({ title, subtitle, skills, type }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        <span className="text-[10px] font-bold text-gray-400">
          {skills.length} SKILLS
        </span>
      </div>

      <div>
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex items-center justify-between border-t border-gray-100 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {skill.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {skill.description}
              </p>
            </div>

            <div className="ml-4 text-right">
              <span
                className={`rounded-md px-2 py-1 text-[9px] font-bold ${
                  type === "human"
                    ? "bg-gray-900 text-white"
                    : type === "augment"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {skill.level}
              </span>

              <p className="mt-1 text-[8px] font-medium text-gray-400">
                LEARN AT THIS DEPTH
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleDetailPage() {
  const { roleId } = useParams();

  const role = roleData[roleId];

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Role not found</h1>

          <Link
            to="/explore"
            className="mt-4 inline-block text-indigo-600"
          >
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">

     

      {/* HERO */}

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1000px] px-5 pb-9 pt-10">

          <Link
            to="/explore"
            className="text-[11px] font-medium text-indigo-600"
          >
            ← All roles
          </Link>

          <h1 className="mt-4 font-serif text-[38px] font-bold leading-tight text-gray-950">
            {role.title}
          </h1>

          <p className="mt-3 max-w-[700px] text-[13px] leading-5 text-gray-500">
            {role.description}
          </p>
        </div>
      </section>

      {/* CONTENT */}

      <section className="bg-[#fafafa]">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-7 px-5 py-9">

          {/* LEFT */}

          <div className="space-y-5">

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <h2 className="font-semibold text-gray-900">
                What the role does
              </h2>

              <div className="mt-4 space-y-3">
                {role.responsibilities.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <Check
                      size={14}
                      className="mt-0.5 text-green-500"
                    />

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gray-900 p-5 text-white">

              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                AI IMPACT STATEMENT
              </p>

              <h2 className="mt-4 font-serif text-[25px] font-bold">
                ~40% of today's tasks are AI-accelerated
              </h2>

              <p className="mt-3 text-xs leading-5 text-gray-300">
                The task mix shifts, but the role does not disappear.
                FutureProof helps you focus your learning where humans
                still have an advantage.
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-indigo-300 bg-white p-5">

              <h2 className="font-semibold text-gray-900">
                Our depth philosophy
              </h2>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Learning everything deeply is impossible. FutureProof
                assigns one of three depth levels to every skill:
                Master, AI-Augment, or Basic-Awareness.
              </p>
            </div>

          </div>

          {/* RIGHT */}

          <div className="space-y-5">

            <SkillSection
              title="Human-Core"
              subtitle="AI struggles here. These are your leverage."
              skills={role.humanCore}
              type="human"
            />

            <SkillSection
              title="AI-Augmented"
              subtitle="You + AI beats either alone. Learn to direct it."
              skills={role.aiAugmented}
              type="augment"
            />

            <SkillSection
              title="AI-Accelerated"
              subtitle="AI does this end-to-end. Spend almost no time here."
              skills={role.aiAccelerated}
              type="basic"
            />

          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-5 py-6">

          <div>
            <h2 className="font-serif text-xl font-bold">
              Ready to see where you stand?
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              A 2-minute chat calibrates your personal skill depth.
            </p>
          </div>

          <Link
            to="/chat"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Analyze My Skills
            <ArrowLeft size={14} className="rotate-180" />
          </Link>

        </div>
      </section>
    </div>
  );
}

export default RoleDetailPage;