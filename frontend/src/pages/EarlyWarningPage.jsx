import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, ShieldCheck, Target } from "lucide-react";
import { getEarlyWarning } from "../services/api";
import { earlyWarningMock } from "../mocks/earlyWarning.mock";

const pct = (n) => `${Math.round(n * 100)}%`;

export default function EarlyWarningPage() {
  const [data, setData] = useState(earlyWarningMock);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getEarlyWarning().then((result) => alive && setData(result)).catch(() => {}).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const risk = data.prediction.probability;
  const band = data.prediction.band;
  const isBaseline = data.prediction.is_baseline || data.prediction.stage === "baseline";
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Learning intelligence</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-gray-950">Early Warning</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Establish a baseline risk immediately after your assessment, inspect the evidence behind it, and see whether the explanation is robust to small changes.</p>
      </div>

      <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm font-semibold text-indigo-950">{isBaseline ? "Baseline risk — established before Skill Gap and Roadmap" : "Updated learning risk"}</p>
        <p className="mt-1 text-sm leading-6 text-indigo-900">{data.source_note || "This signal is based on assessment evidence available at the time of prediction. Skill Gap and Roadmap use the same evidence as downstream actions."}</p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-gray-500">{isBaseline ? "Baseline learning risk" : "Current learning risk"}</p><p className="mt-2 text-5xl font-semibold text-gray-950">{pct(risk)}</p></div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700"><AlertTriangle size={22}/></div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${risk * 100}%` }}/></div>
          <div className="mt-3 flex justify-between text-xs text-gray-500"><span>{band.toUpperCase()} RISK</span><span>{pct(data.prediction.confidence)} model confidence</span></div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <ShieldCheck className="text-indigo-600" size={24}/>
          <p className="mt-4 text-sm text-gray-500">Explanation stability</p>
          <p className="mt-1 text-4xl font-semibold">{data.stability.score ? pct(data.stability.score) : "Pending"}</p>
          <p className="mt-2 text-xs leading-5 text-gray-500">{data.stability.perturbations_tested ? `${data.stability.perturbations_tested} perturbations tested.` : "Official ED-02 perturbation evaluation is pending model training."}</p>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Target size={19} className="text-indigo-600"/><h2 className="font-semibold">Why this warning?</h2></div>
          <div className="mt-5 space-y-4">
            {data.explanation.features.map((item) => <div key={item.name}><div className="mb-1 flex justify-between text-sm"><span className="font-medium text-gray-800">{item.name}</span><span className="text-gray-500">{pct(item.attribution)}</span></div><div className="h-2 rounded-full bg-gray-100"><div className="h-full rounded-full bg-indigo-500" style={{width:`${item.attribution*100}%`}}/></div><p className="mt-1 text-xs leading-5 text-gray-500">{item.evidence}</p></div>)}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">What should happen next?</h2>
          <div className="mt-5 space-y-3">{data.intervention.actions.map((action) => <div key={action} className="flex gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700"><ArrowRight size={17} className="mt-0.5 shrink-0 text-indigo-600"/>{action}</div>)}</div>
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs leading-5 text-indigo-900"><strong>Responsible use:</strong> this is an early-warning signal, not an automated judgment about a student's ability or future.</div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Stability audit</h2><p className="mt-1 text-xs text-gray-500">Small input changes should not cause the model's explanation to jump unpredictably.</p></div><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">{loading ? "Loading" : data.metadata.source === "demo" ? "Demo fallback" : data.metadata.source}</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4"><div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Stability</p><p className="mt-1 text-xl font-semibold">{data.stability.score ? pct(data.stability.score) : "—"}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Compactness</p><p className="mt-1 text-xl font-semibold">{pct(data.explanation.compactness)}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Model</p><p className="mt-1 truncate text-sm font-semibold">{data.metadata.model_version}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-gray-500">Benchmark</p><p className="mt-1 text-sm font-semibold">ED-02</p></div></div>
      </section>
    </main>
  );
}
