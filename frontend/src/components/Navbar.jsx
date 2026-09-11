import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, UserCircle } from "lucide-react";
import { useUser } from "../context/UserContext";
import { setAuthToken } from "../services/api";
export default function Navbar(){
 const location=useLocation(), navigate=useNavigate(); const {name,target_role,logout}=useUser();
 const links=[["/explore","Explore"],["/chat","AI Chat"],["/skill-gap","Skill Gap"],["/early-warning","Early Warning"],["/roadmap","Roadmap"],["/history","History"]];
 const signout=()=>{setAuthToken(null);logout();navigate("/")};
 return <nav className="sticky top-0 z-30 h-[68px] border-b border-gray-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5">
  <Link to="/explore" className="flex items-center gap-2 font-serif text-xl font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><Sparkles size={16}/></span>SkillPilot</Link>
  <div className="hidden items-center gap-5 text-sm md:flex">{links.map(([to,label])=><Link key={to} to={to} className={location.pathname===to?"font-semibold text-indigo-600":"text-gray-600 hover:text-gray-950"}>{label}</Link>)}</div>
  <div className="flex items-center gap-3"><Link to="/profile" className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold hover:border-indigo-200"><UserCircle size={16} className="text-indigo-600"/><span className="hidden sm:inline">{name||"Profile"}</span></Link><button onClick={signout} className="text-xs text-gray-500 hover:text-gray-900">Log out</button></div>
 </div></nav>;
}
