"use client";

import { useEffect, useState } from "react";

type AboutData = { eyebrow: string; heading: string; p1: string; p2: string; cta: string };

function Field({ label, value, onChange, textarea, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; rows?: number }) {
  const cls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {textarea
        ? <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={cls + " resize-none"} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

export default function AboutPage() {
  const [tab, setTab] = useState<"en" | "hk">("en");
  const [en, setEn] = useState<AboutData>({ eyebrow: "", heading: "", p1: "", p2: "", cta: "" });
  const [hk, setHk] = useState<AboutData>({ eyebrow: "", heading: "", p1: "", p2: "", cta: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.en?.about) { setEn(d.en.about); setHk(d.hk.about); } });
  }, []);

  const data = tab === "en" ? en : hk;
  const setData = tab === "en" ? setEn : setHk;
  function update(key: keyof AboutData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const r1 = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "en.about", data: en }) });
      if (!r1.ok) { const d = await r1.json().catch(() => ({})); throw new Error(d.error || `HTTP ${r1.status}`); }
      const r2 = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "hk.about", data: hk }) });
      if (!r2.ok) { const d = await r2.json().catch(() => ({})); throw new Error(d.error || `HTTP ${r2.status}`); }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>About Section</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the about section on the homepage</p>
        </div>
        <button onClick={save} disabled={status === "saving"}
          className="bg-[#C9A454] hover:bg-[#b8933f] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(["en", "hk"] as const).map((l) => (
          <button key={l} onClick={() => setTab(l)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === l ? "bg-[#1A2E4A] text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}>
            {l === "en" ? "🇬🇧 English" : "🇲🇲 Hakha Chin"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <Field label="Eyebrow label" value={data.eyebrow} onChange={(v) => update("eyebrow", v)} />
        <Field label="Heading (use \n for line break)" value={data.heading} onChange={(v) => update("heading", v)} />
        <Field label="Paragraph 1" value={data.p1} onChange={(v) => update("p1", v)} textarea rows={4} />
        <Field label="Paragraph 2" value={data.p2} onChange={(v) => update("p2", v)} textarea rows={3} />
        <Field label="Button text" value={data.cta} onChange={(v) => update("cta", v)} />
      </div>

      {errorMsg && <p className="text-red-500 text-sm mt-3 break-all">{errorMsg}</p>}
    </div>
  );
}
