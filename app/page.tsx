"use client";

import { FormEvent, useState } from "react";

type PlacementResult = {
  summary: string;
  skillScore: number;
  recommendedRoles: { role: string; matchPercentage: number; reason: string }[];
  strongSkills: string[];
  missingSkills: string[];
  technicalQuestions: { question: string; expectedAnswer: string }[];
  hrQuestions: { question: string; sampleAnswer: string }[];
  finalRecommendation: string;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setResult(null); setError("");
    const f = new FormData(event.currentTarget);
    const payload = Object.fromEntries(f.entries());

    try {
      const response = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Analysis failed");
      setResult(data.result);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">AI Placement Assistant</p>
          <h1 className="text-4xl font-bold md:text-6xl">Find your best career path</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Get a placement-readiness score, suitable job roles, skill gaps and personalised interview questions.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:grid-cols-2">
          {[
            ["name","Full name","text",true], ["email","Email address","email",true], ["phone","Phone number","text",false],
            ["department","Department, e.g. CSE","text",true], ["graduationYear","Graduation year","text",false], ["preferredRole","Preferred role","text",false]
          ].map(([name,placeholder,type,required]) => <input key={String(name)} name={String(name)} type={String(type)} required={Boolean(required)} placeholder={String(placeholder)} className="rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none focus:border-cyan-400" />)}
          <textarea name="skills" required placeholder="Skills: HTML, CSS, JavaScript, React, Python, SQL..." className="min-h-32 rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none focus:border-cyan-400 md:col-span-2" />
          <textarea name="projects" placeholder="Describe projects and internship experience" className="min-h-32 rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none focus:border-cyan-400 md:col-span-2" />
          <button disabled={loading} className="rounded-xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-60 md:col-span-2">{loading ? "Analysing profile..." : "Analyse My Profile"}</button>
        </form>

        {error && <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-200">{error}</div>}
        {result && <Results result={result} />}
      </section>
    </main>
  );
}

function Results({ result }: { result: PlacementResult }) {
  return <section className="mt-10 space-y-6">
    <div className="rounded-3xl bg-slate-900 p-6"><h2 className="text-2xl font-bold">Placement Readiness</h2><p className="mt-3 text-5xl font-bold text-cyan-400">{result.skillScore}/100</p><p className="mt-4 text-slate-300">{result.summary}</p></div>
    <div className="grid gap-6 md:grid-cols-2"><List title="Strong Skills" items={result.strongSkills} /><List title="Skills to Improve" items={result.missingSkills} /></div>
    <Card title="Recommended Roles">{result.recommendedRoles?.map(r => <article key={r.role} className="rounded-xl bg-slate-800 p-4"><div className="flex justify-between gap-4"><h3 className="font-bold">{r.role}</h3><span className="text-cyan-300">{r.matchPercentage}% match</span></div><p className="mt-2 text-slate-300">{r.reason}</p></article>)}</Card>
    <Card title="Technical Questions">{result.technicalQuestions?.map((q,i) => <article key={i} className="rounded-xl bg-slate-800 p-4"><p className="font-semibold">{i+1}. {q.question}</p><p className="mt-2 text-slate-300">{q.expectedAnswer}</p></article>)}</Card>
    <Card title="HR Questions">{result.hrQuestions?.map((q,i) => <article key={i} className="rounded-xl bg-slate-800 p-4"><p className="font-semibold">{i+1}. {q.question}</p><p className="mt-2 text-slate-300">{q.sampleAnswer}</p></article>)}</Card>
    <div className="rounded-3xl bg-slate-900 p-6"><h2 className="text-2xl font-bold">Final Recommendation</h2><p className="mt-3 text-slate-300">{result.finalRecommendation}</p></div>
  </section>
}

function Card({title,children}:{title:string;children:React.ReactNode}) { return <div className="rounded-3xl bg-slate-900 p-6"><h2 className="mb-5 text-2xl font-bold">{title}</h2><div className="space-y-4">{children}</div></div>; }
function List({title,items=[]}:{title:string;items?:string[]}) { return <div className="rounded-3xl bg-slate-900 p-6"><h2 className="mb-4 text-xl font-bold">{title}</h2><ul className="space-y-2 text-slate-300">{items.map(i => <li key={i}>• {i}</li>)}</ul></div>; }
