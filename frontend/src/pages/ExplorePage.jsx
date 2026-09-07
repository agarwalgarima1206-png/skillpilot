import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Code2, Palette } from "lucide-react";
import { getRoles } from "../services/api";

const icons = {"Data Scientist":BarChart3,"Software Developer":Code2,"UI/UX Designer (Web & Digital Interface Designer)":Palette,"UI/UX Designer":Palette};
export default function ExplorePage(){
 const [roles,setRoles]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{getRoles().then(setRoles).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 return <main className="min-h-[calc(100vh-68px)] bg-[#fafafa]"><section className="border-b bg-white"><div className="mx-auto max-w-6xl px-5 py-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">STEP 1 · PICK A TARGET ROLE</p><h1 className="mt-3 font-serif text-4xl font-bold">Explore a role. See where AI lands.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">Role evidence comes from the included O*NET dataset. SkillPilot then applies its depth framework to decide where deep expertise is worth the investment.</p></div></section><section className="mx-auto max-w-6xl px-5 py-10">{loading?<p className="text-sm text-gray-500">Loading roles…</p>:error?<ErrorBox text={error}/>:<div className="grid gap-4 md:grid-cols-3">{roles.map(r=><RoleCard key={r.id} role={r}/>)}</div>}</section></main>;
}
function RoleCard({role}){const Icon=icons[role.title]||Code2;return <article className="flex min-h-[300px] flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-indigo-600"><Icon size={20}/></span><span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">{role.impact_tag}</span></div><h2 className="mt-6 font-serif text-2xl font-bold">{role.title}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{role.description}</p><div className="mt-auto pt-6"><Link to={`/role/${role.id}`} className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700">View role <ArrowRight size={15}/></Link></div></article>}
function ErrorBox({text}){return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{text}<p className="mt-2 text-xs">Start the FastAPI backend on port 8000 and refresh.</p></div>}
