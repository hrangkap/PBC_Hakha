"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentBlock, MissionItem } from "@/lib/content";

type MissionSection = { eyebrow: string; heading: string; sub: string };
type FormState = Omit<MissionItem, "id">;

const EMPTY: FormState = {
  title_en: "", title_hk: "",
  description_en: "", description_hk: "",
  image: "",
  blocks: [],
};

function Field({ label, value, onChange, textarea, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; rows?: number; placeholder?: string;
}) {
  const cls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {textarea
        ? <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls + " resize-none"} />
        : <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

type BlockIdx = number;

export default function MissionPage() {
  const [items, setItems]           = useState<MissionItem[]>([]);
  const [enSection, setEnSection]   = useState<MissionSection>({ eyebrow: "", heading: "", sub: "" });
  const [hkSection, setHkSection]   = useState<MissionSection>({ eyebrow: "", heading: "", sub: "" });
  const [sectionTab, setSectionTab] = useState<"en" | "hk">("en");
  const [editing, setEditing]       = useState<string | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [form, setForm]             = useState<FormState>(EMPTY);
  const [status, setStatus]         = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [uploading, setUploading]   = useState(false);
  const [uploadingBlockIdx, setUploadingBlockIdx] = useState<BlockIdx | null>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const blockFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (!d) return;
        if (Array.isArray(d.mission_items)) setItems(d.mission_items.map((it: MissionItem) => ({ ...it, blocks: it.blocks ?? [] })));
        if (d.en?.mission) setEnSection(d.en.mission);
        if (d.hk?.mission) setHkSection(d.hk.mission);
      });
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── blocks helpers ──────────────────────────────────────────────
  function addTextBlock() {
    setField("blocks", [...form.blocks, { type: "text", en: "", hk: "" }]);
  }

  function addImageBlock() {
    setField("blocks", [...form.blocks, { type: "image", src: "", caption_en: "", caption_hk: "", size: "medium", align: "center" }]);
  }

  function updateBlock(i: BlockIdx, patch: Partial<ContentBlock>) {
    const next = form.blocks.map((b, idx) => idx === i ? { ...b, ...patch } as ContentBlock : b);
    setField("blocks", next);
  }

  function moveBlock(i: BlockIdx, dir: -1 | 1) {
    const next = [...form.blocks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setField("blocks", next);
  }

  function removeBlock(i: BlockIdx) {
    setField("blocks", form.blocks.filter((_, idx) => idx !== i));
  }

  async function uploadBlockImage(i: BlockIdx, file: File) {
    setUploadingBlockIdx(i);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "mission");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      if (data.path) updateBlock(i, { src: data.path } as Partial<ContentBlock>);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
    }
    setUploadingBlockIdx(null);
  }

  // ── cover photo ─────────────────────────────────────────────────
  async function uploadCover(file: File) {
    setUploading(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "mission");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      if (data.path) setField("image", data.path);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
    }
    setUploading(false);
  }

  // ── persist ─────────────────────────────────────────────────────
  async function persistItems(updated: MissionItem[]) {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "mission_items", data: updated }),
      });
      if (res.status === 401) { window.location.href = "/admin"; return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
      setStatus("error");
    }
  }

  async function saveSection() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ section: "en.mission", data: enSection }, { section: "hk.mission", data: hkSection }] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
      setStatus("error");
    }
  }

  function startEdit(item: MissionItem) {
    setEditing(item.id);
    setForm({ title_en: item.title_en, title_hk: item.title_hk, description_en: item.description_en, description_hk: item.description_hk, image: item.image ?? "", blocks: item.blocks ?? [] });
    setShowAdd(false);
  }

  function startAdd() { setShowAdd(true); setEditing(null); setForm(EMPTY); }

  function deleteItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    persistItems(updated);
  }

  function saveEdit() {
    const updated = items.map((i) => i.id === editing ? { id: i.id, ...form } : i);
    setItems(updated);
    setEditing(null);
    persistItems(updated);
  }

  function addItem() {
    const newItem: MissionItem = { id: Date.now().toString(), ...form };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAdd(false);
    setForm(EMPTY);
    persistItems(updated);
  }

  const section = sectionTab === "en" ? enSection : hkSection;
  const setSection = sectionTab === "en" ? setEnSection : setHkSection;

  // ── block editor UI ─────────────────────────────────────────────
  function BlockEditor() {
    return (
      <div className="border-t border-gray-100 pt-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Content Blocks</p>
          <div className="flex gap-2">
            <button type="button" onClick={addTextBlock}
              className="text-xs bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
              + Text
            </button>
            <button type="button" onClick={addImageBlock}
              className="text-xs bg-[#C9A454] hover:bg-[#b8933f] text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
              + Image
            </button>
          </div>
        </div>

        {form.blocks.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-lg">
            No content blocks yet. Use + Text or + Image to add content.
          </p>
        )}

        <div className="space-y-3">
          {form.blocks.map((block, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* block header */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${block.type === "text" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                  {block.type === "text" ? "TEXT" : "IMAGE"}
                </span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30 text-gray-500 text-xs">↑</button>
                  <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === form.blocks.length - 1}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30 text-gray-500 text-xs">↓</button>
                  <button type="button" onClick={() => removeBlock(i)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-red-400 text-xs ml-1">✕</button>
                </div>
              </div>

              {/* block body */}
              <div className="p-3 space-y-3">
                {block.type === "text" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">English</label>
                      <textarea rows={4} value={block.en} placeholder="Write paragraph(s) in English…"
                        onChange={(e) => updateBlock(i, { en: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hakha Chin</label>
                      <textarea rows={4} value={block.hk} placeholder="Hakha Chin zohkhat a dah…"
                        onChange={(e) => updateBlock(i, { hk: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454] resize-none" />
                    </div>
                  </>
                )}

                {block.type === "image" && (
                  <>
                    {/* image upload / preview */}
                    <div className="flex items-start gap-3">
                      {block.src
                        ? <img src={block.src} alt="block" className="w-24 h-16 rounded-lg object-cover border-2 border-[#C9A454] shrink-0" />
                        : <div className="w-24 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="m21 15-5-5L5 21"/>
                            </svg>
                          </div>
                      }
                      <div className="flex-1 flex flex-col gap-1.5">
                        <button type="button"
                          onClick={() => { setUploadingBlockIdx(i); blockFileRef.current?.click(); }}
                          disabled={uploadingBlockIdx !== null}
                          className="w-full bg-[#1A2E4A] hover:bg-[#243D5C] disabled:opacity-60 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors">
                          {uploadingBlockIdx === i ? "Uploading…" : "Upload Image"}
                        </button>
                        <input type="text" value={block.src} placeholder="or paste URL / path…"
                          onChange={(e) => updateBlock(i, { src: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C9A454]" />
                      </div>
                    </div>

                    {/* caption */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Caption (English)</label>
                        <input type="text" value={block.caption_en} placeholder="Optional caption…"
                          onChange={(e) => updateBlock(i, { caption_en: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Caption (Hakha Chin)</label>
                        <input type="text" value={block.caption_hk} placeholder="Optional caption…"
                          onChange={(e) => updateBlock(i, { caption_hk: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]" />
                      </div>
                    </div>

                    {/* size + alignment */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Size</label>
                        <div className="flex gap-1">
                          {(["small", "medium", "full"] as const).map((s) => (
                            <button key={s} type="button" onClick={() => updateBlock(i, { size: s })}
                              className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors capitalize ${block.size === s ? "bg-[#1A2E4A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                              {s === "small" ? "S" : s === "medium" ? "M" : "Full"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Alignment</label>
                        <div className="flex gap-1">
                          {(["left", "center", "right"] as const).map((a) => (
                            <button key={a} type="button" onClick={() => updateBlock(i, { align: a })}
                              className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${block.align === a ? "bg-[#1A2E4A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                              {a === "left" ? "←" : a === "center" ? "↔" : "→"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── shared cover + meta fields ───────────────────────────────────
  function FormFields() {
    return (
      <div className="space-y-3 mb-4">
        {/* Cover photo */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cover Photo</label>
          <div className="flex items-start gap-3">
            {form.image
              ? <img src={form.image} alt="preview" className="w-24 h-16 rounded-lg object-cover border-2 border-[#C9A454] shrink-0" />
              : <div className="w-24 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
            }
            <div className="flex-1 flex flex-col gap-1.5">
              <button type="button" onClick={() => coverFileRef.current?.click()} disabled={uploading}
                className="w-full bg-[#1A2E4A] hover:bg-[#243D5C] disabled:opacity-60 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors">
                {uploading ? "Uploading…" : "Upload Cover"}
              </button>
              <input ref={coverFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
              <input type="text" value={form.image} onChange={(e) => setField("image", e.target.value)}
                placeholder="or paste URL / path…"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C9A454]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title (English)"    value={form.title_en} onChange={(v) => setField("title_en", v)} />
          <Field label="Title (Hakha Chin)" value={form.title_hk} onChange={(v) => setField("title_hk", v)} />
        </div>
        <Field label="Short description (English) — shown on card" value={form.description_en} onChange={(v) => setField("description_en", v)} textarea rows={2} />
        <Field label="Short description (Hakha Chin)"              value={form.description_hk} onChange={(v) => setField("description_hk", v)} textarea rows={2} />

        {/* hidden block file input — shared across all image blocks */}
        <input ref={blockFileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && uploadingBlockIdx !== null) uploadBlockImage(uploadingBlockIdx, f);
            if (blockFileRef.current) blockFileRef.current.value = "";
          }} />

        {BlockEditor()}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Our Mission</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} mission activit{items.length !== 1 ? "ies" : "y"}</p>
        </div>
        <button onClick={startAdd}
          className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          + Add Activity
        </button>
      </div>

      {status === "saved" && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Saved successfully</p>}
      {errorMsg && <p className="text-red-500  text-sm bg-red-50   rounded-lg px-3 py-2 mb-4 break-all">{errorMsg}</p>}

      {/* Section heading editor */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#1A2E4A] uppercase tracking-wide">Section Heading</h2>
          <button onClick={saveSection} disabled={status === "saving"}
            className="bg-[#C9A454] hover:bg-[#b8933f] disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors">
            {status === "saving" ? "Saving…" : "Save Heading"}
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          {(["en", "hk"] as const).map((l) => (
            <button key={l} onClick={() => setSectionTab(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sectionTab === l ? "bg-[#1A2E4A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {l === "en" ? "🇬🇧 English" : "🇲🇲 Hakha Chin"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <Field label="Eyebrow label" value={section.eyebrow} onChange={(v) => setSection((p) => ({ ...p, eyebrow: v }))} />
          <Field label="Heading" value={section.heading} onChange={(v) => setSection((p) => ({ ...p, heading: v }))} />
          <Field label="Subtitle / intro paragraph" value={section.sub} onChange={(v) => setSection((p) => ({ ...p, sub: v }))} textarea rows={2} />
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-2 border-[#C9A454]">
          <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>New Mission Activity</h3>
          {FormFields()}
          <div className="flex gap-2">
            <button onClick={addItem}                 className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Add Activity</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
            {editing === item.id ? (
              <>
                {FormFields()}
                <div className="flex gap-2">
                  <button onClick={saveEdit}               className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  {item.image
                    ? <img src={item.image} alt={item.title_en} className="w-20 h-14 rounded-lg object-cover shrink-0" />
                    : <div className="w-20 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="m21 15-5-5L5 21"/>
                        </svg>
                      </div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1A2E4A] text-sm">{item.title_en}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.title_hk}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description_en}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{(item.blocks ?? []).length} block{(item.blocks ?? []).length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(item)}     className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1.5 rounded-lg">Edit</button>
                  <button onClick={() => deleteItem(item.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 font-semibold px-3 py-1.5 rounded-lg">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm shadow-sm">
            No mission activities yet. Click <strong>+ Add Activity</strong> to add the first one.
          </div>
        )}
      </div>
    </div>
  );
}
