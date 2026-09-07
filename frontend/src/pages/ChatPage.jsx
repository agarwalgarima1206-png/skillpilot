import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Check,
  Send,
  ArrowRight,
  CircleHelp,
  ChevronRight,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { analyzeJob } from "../services/api";

function ChatPage() {
  const { userProfile, updateAnswer, setUserProfile } = useUser();

  const questions = [
    {
      key: "mlExperience",
      question:
        "How would you describe your machine-learning experience?",
      options: [
        "I build models from scratch",
        "Mostly AutoML tools",
        "Only coursework so far",
      ],
      responses: {
        "I build models from scratch":
          "Nice — that suggests strong hands-on ML experience. Next, let's check your Python depth.",
        "Mostly AutoML tools":
          "Got it — you have practical exposure, but we'll check how deep your coding experience is. Next: Python.",
        "Only coursework so far":
          "Thanks — that gives me a useful baseline. Next, let's check your Python experience.",
      },
    },
    {
      key: "pythonExperience",
      question: "How comfortable are you with Python?",
      options: [
        "I use Python daily for projects",
        "I can build basic scripts and notebooks",
        "I know the basics but need guidance",
      ],
      responses: {
        "I use Python daily for projects":
          "Great — that's a strong signal for practical Python depth. One more: let's look at your SQL experience.",
        "I can build basic scripts and notebooks":
          "Good foundation. We'll likely focus on strengthening advanced Python skills. One more: SQL.",
        "I know the basics but need guidance":
          "Understood — we'll treat Python as an area for development. One more question: SQL.",
      },
    },
    {
      key: "sqlExperience",
      question: "How much experience do you have with SQL?",
      options: [
        "I use SQL regularly in projects",
        "I know queries and basic database concepts",
        "I've only studied SQL in coursework",
      ],
      responses: {
        "I use SQL regularly in projects":
          "Excellent — regular SQL usage is a strong practical signal.",
        "I know queries and basic database concepts":
          "That's a solid starting point. We can identify which advanced SQL skills would add the most value.",
        "I've only studied SQL in coursework":
          "Got it — we'll treat practical SQL as a skill to strengthen.",
      },
    },
  ];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;

  const addAiMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "ai",
        text,
      },
    ]);
  };

  const analyzeProfile = async () => {
    setIsAnalyzing(true);

    try {
      const result = await analyzeJob({
        job_title: userProfile?.role || "Data Scientist",
        skills: userProfile?.skills?.map((skill) => skill.name) || [],
        industry: "Technology",
        experience: 2,
      });

      console.log("SkillPilot backend response:", result);

      setUserProfile((prev) => ({
        ...prev,
        analysis: result,
      }));

      addAiMessage(
        "Perfect — I've collected your answers and sent your profile to SkillPilot for analysis. Your personalized skill-gap analysis is ready."
      );
    } catch (error) {
      console.error("SkillPilot backend error:", error);

      addAiMessage(
        "I've collected your answers, but I couldn't connect to the SkillPilot analysis service. Please make sure the backend is running."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitAnswer = async (selectedAnswer) => {
    const userMessage = selectedAnswer.trim();

    if (!userMessage || isAnalyzing) return;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userMessage,
      },
    ]);

    updateAnswer(currentQuestion.key, userMessage);
    setAnswer("");

    const aiResponse = currentQuestion.responses[userMessage];

    if (aiResponse) {
      addAiMessage(aiResponse);
    }

    if (isLastQuestion) {
      await analyzeProfile();
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  };

  const handleSend = async () => {
    await submitAnswer(answer);
  };

  const handleQuickAnswer = async (text) => {
    await submitAnswer(text);
  };

  return (

    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      {/* ================= PROGRESS BAR ================= */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1000px] items-center px-5 py-3">
          <div className="flex items-center">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={10} strokeWidth={3} />
            </div>
            <span className="ml-2 text-[10px] text-gray-500">Pick a role</span>
          </div>

          <div className="mx-3 h-px flex-1 bg-gray-200" />

          <div className="flex items-center">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={10} strokeWidth={3} />
            </div>
            <span className="ml-2 text-[10px] text-gray-500">
              Role detail
            </span>
          </div>

          <div className="mx-3 h-px flex-1 bg-gray-200" />

          <div className="flex items-center">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
              3
            </div>
            <span className="ml-2 text-[10px] font-medium text-gray-900">
              AI Onboarding
            </span>
          </div>

          <div className="mx-3 h-px flex-1 bg-gray-200" />

          <div className="flex items-center">
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] text-gray-500">
              4
            </div>
            <span className="ml-2 text-[10px] text-gray-500">
              Skill gap analysis
            </span>
          </div>

          <div className="mx-3 h-px flex-1 bg-gray-200" />

          <div className="flex items-center">
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] text-gray-500">
              5
            </div>
            <span className="ml-2 text-[10px] text-gray-500">Roadmap</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <main className="min-h-[calc(100vh-120px)] px-5 py-9">
        <div className="mx-auto max-w-[1000px]">
          <div className="mx-auto max-w-[600px]">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* ================= CHAT HEADER ================= */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Bot size={16} />
                  </div>

                  <div>
                    <h2 className="text-[11px] font-bold text-gray-900">
                      SkillPilot Copilot
                    </h2>
                    <p className="text-[9px] text-gray-400">
                      {isAnalyzing ? "Analyzing your profile..." : `${questions.length - questionIndex} question${questions.length - questionIndex === 1 ? "" : "s"} left`}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[8px] font-semibold text-green-600">
                  ● Live
                </span>
              </div>

              {/* ================= CHAT BODY ================= */}
              <div className="min-h-[270px] px-5 py-6">
                <div className="mb-4 flex items-start gap-2">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                    <Bot size={10} />
                  </div>

                  <div className="max-w-[430px] rounded-xl rounded-tl-sm border border-gray-200 bg-[#fafafa] px-3 py-2.5 text-[11px] leading-5 text-gray-700">
                    Hi! I’m your SkillPilot Copilot. I’ll ask a few quick
                    questions to understand your current experience and
                    calibrate your skill-gap recommendations.
                  </div>
                </div>

                {/* Current question */}
                <div className="mb-4 flex items-start gap-2">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                    <Bot size={10} />
                  </div>

                  <div className="max-w-[430px] rounded-xl rounded-tl-sm border border-gray-200 bg-[#fafafa] px-3 py-2.5 text-[11px] leading-5 text-gray-700">
                    {currentQuestion.question}
                  </div>
                </div>

                {messages.map((message, index) => {
                  if (message.type === "ai") {
                    return (
                      <div
                        key={index}
                        className="mb-4 flex items-start gap-2"
                      >
                        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                          <Bot size={10} />
                        </div>

                        <div className="max-w-[430px] rounded-xl rounded-tl-sm border border-gray-200 bg-[#fafafa] px-3 py-2.5 text-[11px] leading-5 text-gray-700">
                          {message.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={index} className="mb-4 flex justify-end">
                      <div className="rounded-xl rounded-tr-sm bg-indigo-600 px-3 py-2.5 text-[11px] text-white">
                        {message.text}
                      </div>

                      <div className="ml-2 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[8px] font-bold text-white">
                        M
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ================= QUICK ANSWERS ================= */}
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleQuickAnswer(option)}
                      disabled={isAnalyzing}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[9px] text-gray-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* ================= INPUT ================= */}
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                    placeholder={
                      isAnalyzing
                        ? "Analyzing..."
                        : "Type your answer..."
                    }
                    disabled={isAnalyzing}
                    className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                  />

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isAnalyzing || !answer.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* ================= BOTTOM TEXT ================= */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1 text-[9px] text-gray-400">
              <CircleHelp size={11} />
              <span>Your answers tune every</span>

              <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[7px] font-bold text-white">
                MASTER
              </span>

              <span>or</span>

              <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[7px] font-bold text-white">
                AI-AUGMENT
              </span>

              <span>and</span>

              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[7px] font-bold text-gray-700">
                BASIC-AWARENESS
              </span>

              <span>call in your analysis.</span>
            </div>

            {/* ================= NAVIGATION ================= */}
            <div className="mt-6 flex items-center justify-between">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-indigo-600"
              >
                <ArrowRight size={13} className="rotate-180" />
                Explore roles
              </Link>

              <Link
                to="/skill-gap"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
              >
                Continue to Skill Gap
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
