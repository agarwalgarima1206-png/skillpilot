import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, role, clearSession } = useUser();
  const links = [["/explore", "Explore"], ["/chat", "AI Chat"], ["/skill-gap", "Skill Gap"], ["/roadmap", "Roadmap"]];

  const logout = () => { clearSession(); navigate("/"); };
  return <nav className="sticky top-0 z-20 h-[68px] border-b border-gray-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
      <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><Sparkles size={16}/></span>SkillPilot</Link>
      <div className="flex items-center gap-5 text-sm">
        {links.map(([to,label]) => <Link key={to} to={to} className={location.pathname===to ? "font-semibold text-indigo-600" : "text-gray-600 hover:text-gray-950"}>{label}</Link>)}
        {sessionId && <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 md:inline">{role}</span>}
        <button onClick={logout} className="text-gray-500 hover:text-gray-900">Reset</button>
      </div>
    </div>
  </nav>;
}
