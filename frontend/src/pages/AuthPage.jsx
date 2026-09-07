import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo authentication
    // Later backend/API authentication can be added here.
    navigate("/explore");
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">

      {/* ================= TOP BAR ================= */}
      <div className="h-[72px] bg-white border-b border-gray-200 flex items-center">
        <div className="w-full max-w-[1180px] mx-auto px-6">

          <Link
            to="/"
            className="inline-flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-md bg-[#5146e5] flex items-center justify-center">
              <ShieldCheck
                size={16}
                className="text-white"
              />
            </div>

            <span className="font-serif text-xl font-semibold">
              FutureProof
            </span>
          </Link>

        </div>
      </div>


      {/* ================= MAIN ================= */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-[430px]">

          {/* ================= CARD ================= */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7">

            {/* Logo + title */}
            <div className="mb-6">

              <div className="flex items-center gap-2 mb-5">

                <div className="w-7 h-7 rounded-md bg-[#5146e5] flex items-center justify-center">
                  <ShieldCheck
                    size={16}
                    className="text-white"
                  />
                </div>

                <span className="font-serif text-lg font-semibold">
                  FutureProof
                </span>

              </div>


              <h1 className="font-serif text-[28px] font-bold">
                {mode === "login"
                  ? "Welcome back"
                  : "Create your account"}
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                {mode === "login"
                  ? "Log in to pick up your saved roadmap right where you left it."
                  : "Create an account to save your career roadmap and progress."}
              </p>

            </div>


            {/* ================= TOGGLE ================= */}
            <div className="bg-[#f1f0ee] rounded-xl p-1 flex mb-6">

              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white shadow-sm text-black"
                    : "text-gray-500"
                }`}
              >
                Sign Up
              </button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white shadow-sm text-black"
                    : "text-gray-500"
                }`}
              >
                Log In
              </button>

            </div>


            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Name - Signup only */}
              {mode === "signup" && (
                <div>

                  <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-600 mb-2">
                    NAME
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-[#fcfbfa] text-sm outline-none focus:border-[#5146e5] focus:ring-2 focus:ring-[#5146e5]/10"
                  />

                </div>
              )}


              {/* Email */}
              <div>

                <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-600 mb-2">
                  EMAIL
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="maya@example.com"
                  required
                  className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-[#fcfbfa] text-sm outline-none focus:border-[#5146e5] focus:ring-2 focus:ring-[#5146e5]/10"
                />

              </div>


              {/* Password */}
              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-600">
                    PASSWORD
                  </label>

                  {mode === "login" && (
                    <button
                      type="button"
                      className="text-[10px] font-semibold text-[#5146e5] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}

                </div>


                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 px-3 pr-11 rounded-lg border border-gray-200 bg-[#fcfbfa] text-sm outline-none focus:border-[#5146e5] focus:ring-2 focus:ring-[#5146e5]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>


              {/* ================= SUBMIT ================= */}
              <button
                type="submit"
                className="w-full h-11 mt-2 rounded-lg bg-[#5146e5] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#4439d4] transition shadow-[0_8px_20px_rgba(81,70,229,0.22)]"
              >

                {mode === "login"
                  ? "Log In"
                  : "Create Account"}

                <ArrowRight size={15} />

              </button>

            </form>


            {/* ================= FOOTNOTE ================= */}
            <p className="text-[10px] text-gray-400 text-center mt-5">
              Free during beta · No credit card required · Your answers stay private
            </p>

          </div>


          {/* ================= BACK HOME ================= */}
          <div className="text-center mt-5">

            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-black"
            >
              ← Back to Home
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AuthPage;
