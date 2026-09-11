import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import RoleDetailPage from "./pages/RoleDetailPage";
import ChatPage from "./pages/ChatPage";
import ResultsPage from "./pages/ResultsPage";
import RoadmapPage from "./pages/RoadmapPage";
import AuthPage from "./pages/AuthPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import EarlyWarningPage from "./pages/EarlyWarningPage";
import AppShell from "./components/AppShell";
import { useUser } from "./context/UserContext";
import { setAuthToken } from "./services/api";

function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
        <p className="mt-4 text-sm text-gray-500">Checking your SkillPilot session…</p>
      </div>
    </main>
  );
}

function Protected({ children }) {
  const { token, authReady } = useUser();

  if (!authReady) return <AuthLoading />;

  setAuthToken(token || null);
  return token ? children : <Navigate to="/auth" replace />;
}

function Shell() {
  return (
    <Protected>
      <AppShell />
    </Protected>
  );
}

export default function App() {
  const location = useLocation();
  const { token, authReady } = useUser();
  setAuthToken(token || null);

  if (!authReady && location.pathname !== "/") {
    return <AuthLoading />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/auth"
        element={token ? <Navigate to="/explore" replace /> : <AuthPage />}
      />
      <Route element={<Shell />}>
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/role/:roleId" element={<RoleDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/skill-gap" element={<ResultsPage />} />
        <Route path="/early-warning" element={<EarlyWarningPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
