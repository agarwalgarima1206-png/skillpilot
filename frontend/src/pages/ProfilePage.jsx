import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  UserCircle,
  Target,
  Clock3,
  Sparkles,
  History,
} from "lucide-react";

import {
  getRoles,
  getMe,
  getCurrentSkillGap,
  getCurrentRoadmap,
  updateProfile,
} from "../services/api";

import { useUser } from "../context/UserContext";

export default function ProfilePage() {
  const user = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user.name || "",
    target_role: user.target_role || "",
    weekly_hours: user.weekly_hours || 8,
    learning_goal: user.learning_goal || "Job Ready",
  });

  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [rolesData, me, gap, roadmap] = await Promise.all([
          getRoles(),
          getMe(),
          getCurrentSkillGap().catch(() => null),
          getCurrentRoadmap().catch(() => null),
        ]);

        setRoles(rolesData || []);

        setForm({
          name: me?.name || "",
          target_role: me?.target_role || "",
          weekly_hours: me?.weekly_hours || 8,
          learning_goal: me?.learning_goal || "Job Ready",
        });

        setStats({
          gap,
          roadmap,
        });

        user.updateUser({
          name: me?.name || "",
          target_role: me?.target_role || "",
          weekly_hours: me?.weekly_hours || 8,
          learning_goal: me?.learning_goal || "Job Ready",
        });
      } catch (err) {
        setError(err.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMsg("");
  };

  const save = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMsg("");
    setError("");

    try {
      const updatedUser = await updateProfile({
        ...form,
        name: form.name.trim(),
        weekly_hours: Number(form.weekly_hours),
      });

      user.updateUser(updatedUser);

      setMsg("Profile saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const assessedSkills = stats.gap?.skills?.length || 0;

  const tasks =
    stats.roadmap?.phases?.flatMap((phase) =>
      (phase.skills || []).flatMap((skill) => skill.tasks || [])
    ) || [];

  const completedTasks = tasks.filter((task) => task.done).length;

  const roadmapProgress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : null;

  const selectedRole = roles.find(
    (role) => role.id === form.target_role
  );

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            YOUR SPACE
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold text-gray-950">
            Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage the preferences that shape your future assessments and
            learning roadmaps.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
            Loading your profile…
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">

            {/* Profile form */}
            <form
              onSubmit={save}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {/* Account */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                <UserCircle size={40} className="text-indigo-600" />

                <div>
                  <p className="font-semibold text-gray-900">
                    {user.email}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Account profile
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <Field label="Name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      handleChange("name", e.target.value)
                    }
                    className="input"
                    placeholder="Your name"
                  />
                </Field>

                <Field label="Target role">
                  <select
                    value={form.target_role}
                    onChange={(e) =>
                      handleChange("target_role", e.target.value)
                    }
                    className="input"
                  >
                    <option value="">Choose later</option>

                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Weekly learning time">
                  <div className="relative">
                    <input
                      required
                      type="number"
                      min="1"
                      max="40"
                      value={form.weekly_hours}
                      onChange={(e) =>
                        handleChange(
                          "weekly_hours",
                          e.target.value
                        )
                      }
                      className="input pr-20"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      hours/week
                    </span>
                  </div>
                </Field>

                <Field label="Primary goal">
                  <select
                    value={form.learning_goal}
                    onChange={(e) =>
                      handleChange(
                        "learning_goal",
                        e.target.value
                      )
                    }
                    className="input"
                  >
                    <option>Job Ready</option>
                    <option>Internship</option>
                    <option>Placement / Interview</option>
                    <option>Deep Mastery</option>
                    <option>Portfolio</option>
                  </select>
                </Field>
              </div>

              {/* Selected role */}
              {selectedRole && (
                <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-indigo-600" />

                    <p className="text-xs font-semibold text-indigo-700">
                      Current target role
                    </p>
                  </div>

                  <p className="mt-2 font-semibold text-gray-900">
                    {selectedRole.title}
                  </p>
                </div>
              )}

              {/* Messages */}
              {error && (
                <p className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-600">
                  {error}
                </p>
              )}

              {msg && (
                <p className="mt-5 rounded-xl border border-green-100 bg-green-50 p-3 text-xs leading-5 text-green-700">
                  {msg}
                </p>
              )}

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={15} />

                {saving ? "Saving…" : "Save profile"}
              </button>
            </form>

            {/* Stats */}
            <aside className="space-y-4">

              <StatCard
                icon={<Target />}
                label="AI resilience"
                value={
                  stats.gap?.ai_resilience_score != null
                    ? `${stats.gap.ai_resilience_score}/100`
                    : "Not assessed"
                }
              />

              <StatCard
                icon={<Sparkles />}
                label="Skills assessed"
                value={assessedSkills || "—"}
              />

              <StatCard
                icon={<Clock3 />}
                label="Roadmap progress"
                value={
                  roadmapProgress !== null
                    ? `${roadmapProgress}%`
                    : "Not started"
                }
              />

              <button
                type="button"
                onClick={() => navigate("/history")}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:shadow-sm"
              >
                <History size={18} className="text-indigo-600" />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Assessment & roadmap history
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    View your previous progress
                  </p>
                </div>

                <span className="ml-auto text-gray-400">→</span>
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-xs font-semibold text-gray-600">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-indigo-600">
        <span className="[&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>

        <span className="text-xs font-semibold">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-gray-950">
        {value}
      </p>
    </div>
  );
}