import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Check,
  Send,
  Plus,
  ArrowRight,
  History,
  MessageSquare,
  Loader2,
} from "lucide-react";

import {
  getChatHistory,
  getChatSessions,
  replyChat,
  startChat,
} from "../services/api";

import { useUser } from "../context/UserContext";

export default function ChatPage() {
  const location = useLocation();
  const nav = useNavigate();

  const params = new URLSearchParams(location.search);
  const requestedRole = params.get("role");
  const requestedSession = params.get("session");

  const { target_role, roleId, role, updateUser } = useUser();

  const defaultRole =
    requestedRole ||
    roleId ||
    role ||
    target_role ||
    "data-scientist";

  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(requestedSession || null);
  const [roleIdState, setRoleIdState] = useState(defaultRole);

  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  const initialized = useRef(false);

  // ------------------------------------------------------------
  // LOAD CHAT SESSIONS
  // ------------------------------------------------------------

  const loadSessions = async () => {
    try {
      const result = await getChatSessions();
      setSessions(Array.isArray(result) ? result : []);
      return Array.isArray(result) ? result : [];
    } catch (e) {
      setError(e.message || "Unable to load chat history.");
      return [];
    }
  };

  // ------------------------------------------------------------
  // SAVE CURRENT SESSION IN USER CONTEXT
  // ------------------------------------------------------------

  const saveSessionContext = (session, currentRole) => {
    updateUser({
      sessionId: session || null,
      roleId: currentRole || null,
    });
  };

  // ------------------------------------------------------------
  // START NEW ASSESSMENT
  // ------------------------------------------------------------

  const startNew = async (selectedRole) => {
    setBusy(true);
    setError("");

    try {
      const r = await startChat(selectedRole);

      const newSessionId = r.session_id;
      const newRoleId = r.role_id || selectedRole;

      setSessionId(newSessionId);
      setRoleIdState(newRoleId);

      setMessages(
        r.messages?.map((m) => ({
          type: m.sender,
          text: m.message,
        })) || [
          {
            type: "ai",
            text: r.message,
          },
        ]
      );

      setOptions(r.quick_replies || []);
      setComplete(false);

      saveSessionContext(newSessionId, newRoleId);

      await loadSessions();
    } catch (e) {
      setError(e.message || "Unable to start assessment.");
    } finally {
      setBusy(false);
    }
  };

  // ------------------------------------------------------------
  // OPEN EXISTING SESSION
  // ------------------------------------------------------------

  const openSession = async (session) => {
    setBusy(true);
    setError("");

    try {
      const r = await getChatHistory(session.session_id);

      const currentRole = session.role_id;

      setSessionId(session.session_id);
      setRoleIdState(currentRole);

      setMessages(
        (r.messages || []).map((m) => ({
          type: m.sender,
          text: m.message,
        }))
      );

      setComplete(session.status === "complete");
      setOptions([]);

      saveSessionContext(session.session_id, currentRole);
    } catch (e) {
      setError(e.message || "Unable to open this conversation.");
    } finally {
      setBusy(false);
    }
  };

  // ------------------------------------------------------------
  // INITIAL LOAD
  // ------------------------------------------------------------

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    async function initialize() {
      setError("");

      try {
        // ------------------------------------------------------
        // If URL contains a specific session, open that session
        // ------------------------------------------------------

        if (requestedSession) {
          const r = await getChatHistory(requestedSession);

          setSessionId(requestedSession);

          const currentRole =
            r.role_id ||
            r.role ||
            defaultRole;

          setRoleIdState(currentRole);

          setMessages(
            (r.messages || []).map((m) => ({
              type: m.sender,
              text: m.message,
            }))
          );

          setComplete(
            r.status === "complete" ||
              r.status === "completed"
          );

          setOptions([]);

          saveSessionContext(
            requestedSession,
            currentRole
          );

          await loadSessions();

          return;
        }

        // ------------------------------------------------------
        // If URL contains a role, start a new assessment
        // ------------------------------------------------------

        if (requestedRole) {
          await startNew(requestedRole);
          return;
        }

        // ------------------------------------------------------
        // Otherwise resume an existing assessment if available
        // ------------------------------------------------------

        const list = await loadSessions();

        const current =
          list.find(
            (item) => item.status === "in_progress"
          ) || list[0];

        if (current) {
          await openSession(current);
        } else {
          await startNew(defaultRole);
        }
      } catch (e) {
        setError(
          e.message ||
            "Unable to initialize the assessment."
        );
      }
    }

    initialize();
  }, []);

  // ------------------------------------------------------------
  // SUBMIT ANSWER
  // ------------------------------------------------------------

  const submit = async (text) => {
    const answer = text.trim();

    if (!answer || busy || !sessionId) return;

    setMessages((current) => [
      ...current,
      {
        type: "user",
        text: answer,
      },
    ]);

    setInput("");
    setBusy(true);
    setError("");

    try {
      const r = await replyChat(
        sessionId,
        answer
      );

      setMessages((current) => [
        ...current,
        {
          type: "ai",
          text: r.message,
        },
      ]);

      setOptions(r.quick_replies || []);
      setComplete(!!r.done);

      if (r.done) {
        updateUser({
          sessionId,
          roleId: roleIdState,
        });
      }

      await loadSessions();
    } catch (e) {
      setError(
        e.message ||
          "Unable to send your answer."
      );
    } finally {
      setBusy(false);
    }
  };

  const roleTitle = roleIdState
    ? roleIdState.replaceAll("-", " ")
    : "career";

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#f7f8fb]">
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-5 md:px-5">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className="hidden w-64 shrink-0 rounded-2xl border bg-white p-3 md:block">

          <button
            onClick={() =>
              startNew(
                target_role ||
                  roleId ||
                  role ||
                  "data-scientist"
              )
            }
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus size={14} />
            New assessment
          </button>

          <p className="mt-5 flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <History size={12} />
            Past chats
          </p>

          <div className="mt-2 max-h-[65vh] space-y-1 overflow-y-auto">

            {sessions.length === 0 ? (
              <p className="px-2 py-4 text-xs text-gray-400">
                No previous assessments.
              </p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => openSession(s)}
                  disabled={busy}
                  className={`w-full rounded-xl p-3 text-left transition ${
                    sessionId === s.session_id
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  } disabled:opacity-60`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={13} />

                    <span className="truncate text-xs font-semibold">
                      {(s.role_id || "Assessment").replaceAll(
                        "-",
                        " "
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] text-gray-400">
                    {s.updated_at
                      ? new Date(
                          s.updated_at
                        ).toLocaleDateString()
                      : "Recently"}{" "}
                    · {s.status || "in progress"}
                  </p>
                </button>
              ))
            )}

          </div>
        </aside>

        {/* =====================================================
            MAIN CHAT
        ====================================================== */}

        <section className="min-w-0 flex-1">

          {/* HEADER */}

          <div className="mb-4 flex items-end justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
                AI COACH
              </p>

              <h1 className="mt-2 font-serif text-3xl font-bold capitalize">
                Your {roleTitle} assessment
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Answer honestly. SkillPilot uses your
                responses to understand your current
                skill level.
              </p>
            </div>

            <button
              onClick={() =>
                startNew(
                  target_role ||
                    roleId ||
                    role ||
                    "data-scientist"
                )
              }
              disabled={busy}
              className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-semibold hover:border-indigo-200 disabled:opacity-50 md:hidden"
            >
              <Plus size={13} />
              New
            </button>

          </div>

          {/* CHAT CARD */}

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

            {/* MESSAGES */}

            <div className="max-h-[58vh] space-y-4 overflow-y-auto p-5">

              {messages.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2
                    className="animate-spin"
                    size={14}
                  />
                  Loading conversation…
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={`${sessionId}-${i}`}
                  className={`flex ${
                    m.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      m.type === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {m.type === "ai" && (
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        <Bot size={12} />
                        SkillPilot AI
                      </div>
                    )}

                    {m.text}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  Thinking…
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

            </div>

            {/* =================================================
                INPUT / COMPLETION
            ================================================== */}

            {!complete ? (
              <div className="border-t bg-gray-50 p-4">

                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Suggested replies
                </p>

                <div className="flex flex-wrap gap-2">

                  {options.map((option) => (
                    <button
                      key={option}
                      disabled={busy}
                      onClick={() =>
                        submit(option)
                      }
                      className="rounded-full border bg-white px-3 py-2 text-xs font-medium hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
                    >
                      {option}
                    </button>
                  ))}

                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(input);
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) =>
                      setInput(e.target.value)
                    }
                    disabled={busy}
                    placeholder="Or answer in your own words…"
                    className="h-11 flex-1 rounded-xl border bg-white px-3 text-sm outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={
                      busy ||
                      !input.trim()
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </form>

              </div>
            ) : (
              <div className="border-t bg-gray-50 p-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Check
                        size={15}
                        className="text-green-600"
                      />
                      Assessment saved
                    </p>

                    <p className="text-xs text-gray-500">
                      Your answers are ready for skill-gap
                      analysis.
                    </p>
                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        nav("/skill-gap")
                      }
                      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Skill Gap{" "}
                      <ArrowRight
                        className="ml-1 inline"
                        size={14}
                      />
                    </button>

                    <button
                      onClick={() =>
                        nav("/roadmap")
                      }
                      className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
                    >
                      Roadmap
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}