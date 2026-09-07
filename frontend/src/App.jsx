import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import RoleDetailPage from "./pages/RoleDetailPage";
import ChatPage from "./pages/ChatPage";
import ResultsPage from "./pages/ResultsPage";
import RoadmapPage from "./pages/RoadmapPage";
import AuthPage from "./pages/AuthPage";
import AppShell from "./components/AppShell";

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage/>}/><Route path="/auth" element={<AuthPage/>}/>
    <Route element={<AppShell/>}>
      <Route path="/explore" element={<ExplorePage/>}/><Route path="/role/:roleId" element={<RoleDetailPage/>}/>
      <Route path="/chat" element={<ChatPage/>}/><Route path="/skill-gap" element={<ResultsPage/>}/><Route path="/roadmap" element={<RoadmapPage/>}/>
    </Route>
  </Routes>;
}
