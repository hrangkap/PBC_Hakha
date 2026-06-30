"use client";

import { useEffect, useState } from "react";

type InfoBarItem = { title: string; value: string };
type TimeItem = { day: string; time: string; label: string };
type FooterData = { tagline: string; quickLinks: string; services: string; contact: string; address: string; phone: string; email: string; copy: string; times: TimeItem[] };

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition" />
    </div>
  );
}

export default function GeneralPage() {
  const [tab, setTab] = useState<"en" | "hk">("en");
  const [enInfoBar, setEnInfoBar] = useState<InfoBarItem[]>([]);
  const [hkInfoBar, setHkInfoBar] = useState<InfoBarItem[]>([]);
  const [enFooter, setEnFooter] = useState<FooterData>({ tagline: "", quickLinks: "", services: "", contact: "", address: "", phone: "", email: "", copy: "", times: [] });
  const [hkFooter, setHkFooter] = useState<FooterData>({ tagline: "", quickLinks: "", services: "", contact: "", address: "", phone: "", email: "", copy: "", times: [] });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/content").then((r) => (r.ok ? r.json() : null)).then((d) => { if (!d?.en) return;
      setEnInfoBar(d.en.infoBar);
      setHkInfoBar(d.hk.infoBar);
      setEnFooter({ tagline: d.en.footer.tagline, quickLinks: d.en.footer.quickLinks, services: d.en.footer.services, contact: d.en.footer.contact, address: d.en.footer.address, phone: d.en.footer.phone, email: d.en.footer.email, copy: d.en.footer.copy, times: d.en.footer.times });
      setHkFooter({ tagline: d.hk.footer.tagline, quickLinks: d.hk.footer.quickLinks, services: d.hk.footer.services, contact: d.hk.footer.contact, address: d.hk.footer.address, phone: d.hk.footer.phone, email: d.hk.footer.email, copy: d.hk.footer.copy, times: d.hk.footer.times });
    });
  }, []);

  const infoBar = tab === "en" ? enInfoBar : hkInfoBar;
  const setInfoBar = tab === "en" ? setEnInfoBar : setHkInfoBar;
  const footer = tab === "en" ? enFooter : hkFooter;
  const setFooter = tab === "en" ? setEnFooter : setHkFooter;

  async function save() {
    setStatus("saving");
    try {
      const [enFull, hkFull] = await Promise.all([
        fetch("/api/admin/content").then((r) => r.json()).then((d) => d.en),
        fetch("/api/admin/content").then((r) => r.json()).then((d) => d.hk),
      ]);
      await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "en.infoBar", data: enInfoBar }) });
      await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "hk.infoBar", data: hkInfoBar }) });
      await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "en.footer", data: { ...enFull.footer, ...enFooter } }) });
      await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "hk.footer", data: { ...hkFull.footer, ...hkFooter } }) });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch { setStatus("error"); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>General Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Service times, info bar, and footer details</p>
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

      {/* Info bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>
          Info Bar (Hero bottom strip)
        </h2>
        <div className="space-y-4">
          {infoBar.map((item, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={`Item ${i + 1} title`} value={item.title} onChange={(v) => setInfoBar((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))} />
              <Field label={`Item ${i + 1} value`} value={item.value} onChange={(v) => setInfoBar((p) => p.map((x, j) => j === i ? { ...x, value: v } : x))} />
            </div>
          ))}
        </div>
      </div>

      {/* Service times */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Service Times</h2>
        <div className="space-y-4">
          {footer.times.map((t, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Day" value={t.day} onChange={(v) => setFooter((p) => ({ ...p, times: p.times.map((x, j) => j === i ? { ...x, day: v } : x) }))} />
              <Field label="Time" value={t.time} onChange={(v) => setFooter((p) => ({ ...p, times: p.times.map((x, j) => j === i ? { ...x, time: v } : x) }))} />
              <Field label="Label" value={t.label} onChange={(v) => setFooter((p) => ({ ...p, times: p.times.map((x, j) => j === i ? { ...x, label: v } : x) }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer section header labels */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Footer Section Labels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Quick Links heading" value={footer.quickLinks} onChange={(v) => setFooter((p) => ({ ...p, quickLinks: v }))} />
          <Field label="Service Times heading" value={footer.services} onChange={(v) => setFooter((p) => ({ ...p, services: v }))} />
          <Field label="Contact heading" value={footer.contact} onChange={(v) => setFooter((p) => ({ ...p, contact: v }))} />
        </div>
      </div>

      {/* Footer details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Footer Details</h2>
        <div className="space-y-4">
          <Field label="Tagline" value={footer.tagline} onChange={(v) => setFooter((p) => ({ ...p, tagline: v }))} />
          <Field label="Address" value={footer.address} onChange={(v) => setFooter((p) => ({ ...p, address: v }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Phone" value={footer.phone} onChange={(v) => setFooter((p) => ({ ...p, phone: v }))} />
            <Field label="Email" value={footer.email} onChange={(v) => setFooter((p) => ({ ...p, email: v }))} />
          </div>
          <Field label="Copyright text" value={footer.copy} onChange={(v) => setFooter((p) => ({ ...p, copy: v }))} />
        </div>
      </div>

      {status === "error" && <p className="text-red-500 text-sm mt-3">Failed to save. Please try again.</p>}
    </div>
  );
}
