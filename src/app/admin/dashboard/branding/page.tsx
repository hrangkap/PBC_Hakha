"use client";

import { useEffect, useRef, useState } from "react";
import type { BrandingConfig } from "@/lib/content";

const DEFAULT: BrandingConfig = {
  churchName_en: "", churchName_hk: "",
  subtitle_en: "", subtitle_hk: "",
  logoUrl: "/images/church_logo.png",
  heroImageUrl: "/images/church_outside.png",
  aboutImageUrl: "/images/church_outside.png",
  facebookUrl: "", youtubeUrl: "", instagramUrl: "",
};

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition"
      />
    </div>
  );
}

function ImageUploadField({ label, value, onChange, folder }: { label: string; value: string; onChange: (v: string) => void; folder: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true); setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.status === 401) { window.location.href = "/admin"; return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange(json.path);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="" className="h-16 w-16 object-contain rounded-xl border border-gray-100 bg-gray-50 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <input
            type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="/images/..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] transition mb-2"
          />
          <label className={`inline-flex items-center gap-2 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${uploading ? "bg-gray-100 text-gray-400" : "bg-[#1A2E4A] text-white hover:bg-[#243D5C]"}`}>
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {uploading ? "Uploading…" : "Upload Image"}
          </label>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default function BrandingPage() {
  const [form, setForm] = useState<BrandingConfig>(DEFAULT);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => { if (r.status === 401) { window.location.href = "/admin"; return null; } return r.ok ? r.json() : null; })
      .then((d) => { if (d?.branding) setForm(d.branding); });
  }, []);

  function set(key: keyof BrandingConfig, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function save() {
    setStatus("saving");
    setSaveError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "branding", data: form }),
      });
      if (res.status === 401) { window.location.href = "/admin"; return; }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Server error ${res.status}`);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Branding</h1>
          <p className="text-sm text-gray-500 mt-1">Church name, logo, images, and social links — change these to reuse the site for any church.</p>
        </div>
        <button onClick={save} disabled={status === "saving"}
          className="bg-[#C9A454] hover:bg-[#b8933f] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {status === "error" && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4">Failed to save: {saveError || "Please try again."}</p>}

      {/* Church Identity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Church Identity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Church Name (English)" value={form.churchName_en} onChange={(v) => set("churchName_en", v)} placeholder="PBC Hakha" />
          <Field label="Church Name (Hakha Chin)" value={form.churchName_hk} onChange={(v) => set("churchName_hk", v)} placeholder="PBC Hakha" />
          <Field label="Subtitle (English)" value={form.subtitle_en} onChange={(v) => set("subtitle_en", v)} placeholder="Church" />
          <Field label="Subtitle (Hakha Chin)" value={form.subtitle_hk} onChange={(v) => set("subtitle_hk", v)} placeholder="Pawlpi" />
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Church Logo</h2>
        <ImageUploadField label="Logo Image" value={form.logoUrl} onChange={(v) => set("logoUrl", v)} folder="branding" />
        <p className="text-gray-400 text-xs mt-2">Appears in the navigation bar and footer. Use a PNG with transparent background for best results.</p>
      </div>

      {/* Site Images */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Site Images</h2>
        <div className="space-y-5">
          <ImageUploadField label="Hero Background Photo" value={form.heroImageUrl} onChange={(v) => set("heroImageUrl", v)} folder="branding" />
          <ImageUploadField label="About Section Photo" value={form.aboutImageUrl} onChange={(v) => set("aboutImageUrl", v)} folder="branding" />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-[#1A2E4A] mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Social Media Links</h2>
        <div className="space-y-4">
          <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => set("facebookUrl", v)} placeholder="https://www.facebook.com/..." />
          <Field label="YouTube URL" value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} placeholder="https://www.youtube.com/..." />
          <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => set("instagramUrl", v)} placeholder="https://www.instagram.com/..." />
        </div>
      </div>
    </div>
  );
}
