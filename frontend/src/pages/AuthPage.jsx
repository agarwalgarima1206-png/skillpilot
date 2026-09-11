import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { login, signup } from "../services/api";
import { useUser } from "../context/UserContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const navigate = useNavigate();
  const { login: saveLogin } = useUser();

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setNotice("");
    setPassword("");
  };

  const submit = async (e) => {
    e.preventDefault();

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (mode === "signup") {
        const result = await signup({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        setNotice(
          result?.message ||
            "Account created successfully. Please log in."
        );

        setMode("login");
        setPassword("");
      } else {
        const result = await login({
          email: email.trim(),
          password,
        });

        saveLogin(result);
        navigate("/explore");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-8">
      {/* Top navigation */}
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-serif text-lg font-bold text-gray-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles size={15} />
          </span>
          SkillPilot
        </Link>
      </div>

      {/* Auth area */}
      <div className="mx-auto flex min-h-[calc(100vh-110px)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm md:grid-cols-2">

          {/* Left information panel */}
          <div className="hidden bg-indigo-600 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                AI Career Navigation
              </p>

              <h1 className="mt-5 font-serif text-4xl font-bold leading-tight">
                Build skills that stay relevant.
              </h1>

              <p className="mt-5 text-sm leading-7 text-indigo-100">
                SkillPilot helps you understand your skill gaps, decide the
                right learning depth, and build a personalized roadmap for
                your target career.
              </p>
            </div>

            <div className="space-y-3 text-sm text-indigo-100">
              <p>✓ AI-assisted skill assessment</p>
              <p>✓ Learning depth based on AI impact</p>
              <p>✓ Personalized career roadmap</p>
            </div>
          </div>

          {/* Form panel */}
          <div className="p-7 sm:p-9">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 md:hidden"
            >
              <ArrowLeft size={13} />
              Back
            </Link>

            <h2 className="mt-5 font-serif text-3xl font-bold text-gray-950">
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {mode === "login"
                ? "Continue your career planning journey."
                : "Save your assessments, skill gaps and roadmap progress."}
            </p>

            {/* Login / Signup switch */}
            <div className="mt-7 flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Sign up
              </button>

              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Log in
              </button>
            </div>

            {/* Messages */}
            {notice && (
              <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-3 text-xs leading-5 text-green-700">
                {notice}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Name
                  </label>

                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Email
                </label>

                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Password
                </label>

                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6+ characters"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? "Please wait…"
                  : mode === "login"
                  ? "Log in"
                  : "Create account"}

                {!busy && <ArrowRight size={15} />}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] leading-5 text-gray-400">
              Your account keeps your career assessments, skill gaps and
              roadmap progress available when you return.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}