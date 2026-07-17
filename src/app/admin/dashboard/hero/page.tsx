"use client";

import { useEffect, useState } from "react";

type HeroData = { eyebrow: string; title: string[]; sub: string; cta1: string; cta2: string };

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {textarea
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={cls + " resize-none"} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

export default function HeroPage() {
  const [tab, setTab] = useState<"en" | "hk">("en");
  const [en, setEn] = useState<HeroData>({ eyebrow: "", title: ["", "", ""], sub: "", cta1: "", cta2: "" });
  const [hk, setHk] = useState<HeroData>({ eyebrow: "", title: ["", "", ""], sub: "", cta1: "", cta2: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.en?.hero) { setEn(d.en.hero); setHk(d.hk.hero); } });
  }, []);

  const data = tab === "en" ? en : hk;
  const setData = tab === "en" ? setEn : setHk;

  function update(key: keyof HeroData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }
  function updateTitle(i: number, value: string) {
    setData((prev) => {
      const t = [...prev.title];
      t[i] = value;
      return { ...prev, title: t };
    });
  }

  async function save() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const r1 = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "en.hero", data: en }),
      });
      if (!r1.ok) { const d = await r1.json().catch(() => ({})); throw new Error(d.error || `HTTP ${r1.status}`); }
      const r2 = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "hk.hero", data: hk }),
      });
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
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Hero & Motto</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the hero banner displayed on the homepage</p>
        </div>
        <button
          onClick={save}
          disabled={status === "saving"}
          className="bg-[#C9A454] hover:bg-[#b8933f] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {/* Lang tabs */}
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
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title (3 lines)</label>
          <div className="space-y-2">
            {data.title.map((line, i) => (
              <input key={i} type="text" value={line} onChange={(e) => updateTitle(i, e.target.value)}
                placeholder={`Line ${i + 1}`}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition" />
            ))}
          </div>
        </div>
        <Field label="Subtitle" value={data.sub} onChange={(v) => update("sub", v)} textarea />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Button 1 text" value={data.cta1} onChange={(v) => update("cta1", v)} />
          <Field label="Button 2 text" value={data.cta2} onChange={(v) => update("cta2", v)} />
        </div>
      </div>

      {errorMsg && <p className="text-red-500 text-sm mt-3 break-all">{errorMsg}</p>}
    </div>
  );
}
