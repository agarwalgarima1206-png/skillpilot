import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  ArrowRight,
  History,
  MessageSquare,
  BarChart3,
  Map,
  CheckCircle2,
} from "lucide-react";

import { getAnalyses } from "../services/api";

export default function HistoryPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getAnalyses();
        setItems(data || []);
      } catch (err) {
        setError(err.message || "Unable to load your history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatRole = (roleId) => {
    if (!roleId) return "Career assessment";

    return roleId
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-5 py-10">

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <History size={18} />
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              SAVED WORK
            </p>

            <h1 className="font-serif text-3xl font-bold text-gray-950">
              Your journey
            </h1>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Your previous assessments are saved here. Current Chat, Skill Gap
          and Roadmap pages always load the latest data from your account.
        </p>

        {/* Error */}
        {error && (
          <p className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-600">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
            Loading your journey…
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <History
              size={28}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 font-serif text-xl font-bold text-gray-900">
              No saved assessments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Choose a role and complete your first AI assessment. Your
              assessment history will appear here.
            </p>

            <button
              onClick={() => navigate("/explore")}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Explore roles
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* History list */}
        {!loading && items.length > 0 && (
          <div className="mt-7 space-y-4">
            {items.map((item) => (
              <article
                key={item.session_id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-gray-900">
                        {formatRole(item.role_id)}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${
                          item.status === "complete"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.status || "in progress"}
                      </span>
                    </div>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock3 size={12} />

                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  {item.status === "complete" && (
                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />
                  )}
                </div>

                {/* Actions */}
                {item.status === "complete" && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">

                    <button
                      onClick={() =>
                        navigate(
                          `/chat?session=${item.session_id}`
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      <MessageSquare size={13} />
                      Chat
                    </button>

                    <button
                      onClick={() => navigate("/skill-gap")}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      <BarChart3 size={13} />
                      Skill Gap
                    </button>

                    <button
                      onClick={() => navigate("/roadmap")}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      <Map size={13} />
                      Current Roadmap
                    </button>

                    <ArrowRight
                      size={15}
                      className="ml-auto self-center text-gray-300"
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}