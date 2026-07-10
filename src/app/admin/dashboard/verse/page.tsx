"use client";

import { useEffect, useState } from "react";

type VerseData = { text: string; ref: string };

export default function VersePage() {
  const [en, setEn] = useState<VerseData>({ text: "", ref: "" });
  const [hk, setHk] = useState<VerseData>({ text: "", ref: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d) {
          setEn(d.en.verse);
          setHk(d.hk.verse);
        }
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    await Promise.all([
      fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "en.verse", data: en }),
      }),
      fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "hk.verse", data: hk }),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400 text-sm">Loading…</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>
          Bible Verse
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit the scripture verse displayed on the homepage.
        </p>
      </div>

      <div className="space-y-6">
        {/* English */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#1A2E4A] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#1A2E4A] text-white text-xs flex items-center justify-center font-bold">EN</span>
            English
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Verse Text
              </label>
              <textarea
                rows={4}
                value={en.text}
                onChange={(e) => setEn({ ...en, text: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A2E4A] focus:outline-none focus:ring-2 focus:ring-[#C9A454]/40 resize-none"
                placeholder="For God so loved the world…"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Reference
              </label>
              <input
                type="text"
                value={en.ref}
                onChange={(e) => setEn({ ...en, ref: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A2E4A] focus:outline-none focus:ring-2 focus:ring-[#C9A454]/40"
                placeholder="John 3:16"
              />
            </div>
          </div>
        </div>

        {/* Hakha Chin */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#1A2E4A] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#C9A454] text-white text-xs flex items-center justify-center font-bold">HK</span>
            Hakha Chin
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Verse Text (Hakha Chin)
              </label>
              <textarea
                rows={4}
                value={hk.text}
                onChange={(e) => setHk({ ...hk, text: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A2E4A] focus:outline-none focus:ring-2 focus:ring-[#C9A454]/40 resize-none"
                placeholder="Pathian in kha thlalang…"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Reference
              </label>
              <input
                type="text"
                value={hk.ref}
                onChange={(e) => setHk({ ...hk, ref: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A2E4A] focus:outline-none focus:ring-2 focus:ring-[#C9A454]/40"
                placeholder="John 3:16"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#1A2E4A] rounded-2xl p-8 text-center">
          <p className="text-sm text-[#C9A454] font-semibold uppercase tracking-widest mb-4">Preview</p>
          <blockquote className="text-white text-lg font-light italic leading-relaxed max-w-xl mx-auto mb-3">
            "{en.text}"
          </blockquote>
          <p className="text-[#C9A454] font-semibold text-sm">— {en.ref}</p>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1A2E4A] hover:bg-[#243D5C] disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
