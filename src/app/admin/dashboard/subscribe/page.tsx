"use client";

import { useEffect, useState } from "react";

type CtaContent = {
  heading: string; sub: string; button: string;
  placeholder: string; successMsg: string; errorMsg: string;
};

const EMPTY: CtaContent = { heading: "", sub: "", button: "", placeholder: "", successMsg: "", errorMsg: "" };

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition" />
      )}
    </div>
  );
}

export default function SubscribePage() {
  const [tab, setTab] = useState<"en" | "hk">("en");
  const [en, setEn] = useState<CtaContent>(EMPTY);
  const [hk, setHk] = useState<CtaContent>(EMPTY);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => { if (r.status === 401) { window.location.href = "/admin"; return null; } return r.ok ? r.json() : null; })
      .then((d) => {
        if (!d) return;
        if (d.en?.cta) setEn(d.en.cta);
        if (d.hk?.cta) setHk(d.hk.cta);
      });
  }, []);

  const form = tab === "en" ? en : hk;
  const setForm = tab === "en" ? setEn : setHk;
  const set = (key: keyof CtaContent, val: string) => setForm((p) => ({ ...p, [key]: val }));

  async function save() {
    setStatus("saving");
    try {
      await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "en.cta", data: en }) });
      await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "hk.cta", data: hk }) });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch { setStatus("error"); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Subscribe Section</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the subscription banner content shown at the bottom of the homepage.</p>
        </div>
        <button onClick={save} disabled={status === "saving"}
          className="bg-[#C9A454] hover:bg-[#b8933f] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {status === "error" && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4">Failed to save. Please try again.</p>}

      <div className="flex gap-2 mb-6">
        {(["en", "hk"] as const).map((l) => (
          <button key={l} onClick={() => setTab(l)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === l ? "bg-[#1A2E4A] text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}>
            {l === "en" ? "🇬🇧 English" : "🇲🇲 Hakha Chin"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <Field label="Heading" value={form.heading} onChange={(v) => set("heading", v)} />
        <Field label="Sub-text" value={form.sub} onChange={(v) => set("sub", v)} multiline />
        <Field label="Button Text" value={form.button} onChange={(v) => set("button", v)} />
        <Field label="Email Placeholder" value={form.placeholder} onChange={(v) => set("placeholder", v)} />
        <Field label="Success Message" value={form.successMsg} onChange={(v) => set("successMsg", v)} />
        <Field label="Error Message" value={form.errorMsg} onChange={(v) => set("errorMsg", v)} />
      </div>
    </div>
  );
}
