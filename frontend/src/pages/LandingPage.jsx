function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      


      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-gray-100">
        
        {/* Background grid */}
        <div className="absolute inset-0 opacity-40">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Purple glow */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-2 items-center gap-16 px-6 py-20">
          
          {/* LEFT */}
          <div>
            
            

            {/* Heading */}
            <h1 className="max-w-xl font-serif text-6xl font-bold leading-[1.05] tracking-tight">
              Will your skills
              <br />
              survive the{" "}
              <span className="text-indigo-600">AI era?</span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-gray-500">
              Most tools hand you a flat list of skills to learn. FutureProof
              goes further — for every skill it tells you the depth to learn it
              at: Master it, AI-Augment it, or just stay aware of it.
            </p>

            {/* Buttons */}
            <div className="mt-7 flex items-center gap-4">
              <button className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
                Start Your FutureProof Journey →
              </button>

              <button className="text-sm font-medium text-indigo-600 hover:underline">
                Already have an account? Log in
              </button>
            </div>

            <button className="mt-3 text-sm text-gray-500 hover:text-gray-800">
              Browse careers first
            </button>

            {/* Depth labels */}
            <div className="mt-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                DEPTH CALLS WE MAKE
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-gray-900 px-2 py-1 font-semibold text-white">
                  MASTER
                </span>
                <span className="text-gray-500">
                  go deep, this is your moat
                </span>

                <span className="rounded bg-indigo-600 px-2 py-1 font-semibold text-white">
                  AI-AUGMENT
                </span>
                <span className="text-gray-500">
                  pair with AI, not against it
                </span>

                <span className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-700">
                  BASIC-AWARENESS
                </span>
                <span className="text-gray-500">
                  know it exists, move on
                </span>
              </div>
            </div>
          </div>


          {/* RIGHT — RECOMMENDATION CARD */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/60">
            
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Your depth recommendations
              </h3>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                Sample · Data Scientist
              </span>
            </div>

            {/* Skill 1 */}
            <div className="border-b border-gray-100 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Experiment Design
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Framing the question stays yours — go deep.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                    ● Human-Core
                  </span>

                  <span className="rounded bg-gray-900 px-2 py-1 text-[10px] font-bold text-white">
                    MASTER
                  </span>
                </div>
              </div>
            </div>

            {/* Skill 2 */}
            <div className="border-b border-gray-100 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    SQL & Data Modeling
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    AI writes the queries — you keep judgment.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-700">
                    ● AI-Augmented
                  </span>

                  <span className="rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white">
                    AI-AUGMENT
                  </span>
                </div>
              </div>
            </div>

            {/* Skill 3 */}
            <div className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Dashboard Reporting
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    AI handles the end-to-end — just stay aware.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-600">
                    ● AI-Accelerated
                  </span>

                  <span className="rounded bg-gray-200 px-2 py-1 text-[10px] font-bold text-gray-600">
                    BASIC-AWARENESS
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-500">
              Not just what to learn — the depth to learn it at.
            </div>
          </div>
        </div>
      </section>


      {/* THREE STEPS */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        
        <div className="grid grid-cols-3 gap-4">
          
          {/* Card 1 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-indigo-600">
                ◎
              </div>

              <span className="text-sm text-gray-300">01</span>
            </div>

            <h3 className="text-sm font-bold">
              Analyze your career
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              A short conversation maps every skill you rely on — then calls
              what AI will do to each one: keep it human, augment it, or
              accelerate it past you.
            </p>
          </div>


          {/* Card 2 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-indigo-600">
                ◉
              </div>

              <span className="text-sm text-gray-300">02</span>
            </div>

            <h3 className="text-sm font-bold">
              Find skill gaps
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Compare where you stand against your target role is heading.
              Every gap comes with a depth call, not just a name in a list.
            </p>
          </div>


          {/* Card 3 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-indigo-600">
                ⤴
              </div>

              <span className="text-sm text-gray-300">03</span>
            </div>

            <h3 className="text-sm font-bold">
              Build your roadmap
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Get a 90-day plan that says exactly how deep to go on each skill
              — Master it, AI-Augment it, or keep Basic-Awareness and move on.
            </p>
          </div>

        </div>


        {/* CTA */}
        <div className="mt-10 flex items-center justify-between rounded-xl bg-gray-900 px-8 py-5 text-white">
          <p className="font-serif text-sm font-semibold">
            Three steps. One honest answer about your future.
          </p>

          <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100">
            Begin with a role →
          </button>
        </div>

      </section>

    </div>
  )
}

export default LandingPage
