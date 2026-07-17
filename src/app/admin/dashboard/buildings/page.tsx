"use client";

import { useEffect, useRef, useState } from "react";
import type { BuildingItem } from "@/lib/content";

function Field({ label, value, onChange, textarea, rows = 4 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  const cls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      {textarea
        ? <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

const EMPTY = { image: "", name_en: "", name_hk: "", caption_en: "", caption_hk: "", history_en: "", history_hk: "" };

type FormState = Omit<BuildingItem, "id">;

export default function BuildingsPage() {
  const [items, setItems]     = useState<BuildingItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [status, setStatus]   = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (Array.isArray(d?.buildings_items)) setItems(d.buildings_items); });
  }, []);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "buildings");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      if (data.path) set("image", data.path);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function persist(updated: BuildingItem[]) {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "buildings_items", data: updated }),
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

  function startEdit(item: BuildingItem) {
    const { id, ...rest } = item; void id;
    setEditing(item.id);
    setForm({ ...EMPTY, ...rest });
    setShowAdd(false);
  }

  function startAdd() {
    setShowAdd(true);
    setEditing(null);
    setForm(EMPTY);
  }

  function deleteItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    persist(updated);
  }

  function saveEdit() {
    const updated = items.map((i) => i.id === editing ? { id: i.id, ...form } : i);
    setItems(updated);
    setEditing(null);
    persist(updated);
  }

  function addItem() {
    const newItem: BuildingItem = { id: Date.now().toString(), ...form };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAdd(false);
    setForm(EMPTY);
    persist(updated);
  }

  function FormFields() {
    return (
      <div className="space-y-3 mb-4">
        {/* Photo picker */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Photo</label>
          <div className="flex items-start gap-3">
            {form.image
              ? <img src={form.image} alt="preview" className="w-20 h-16 rounded-lg object-cover border-2 border-[#C9A454] shrink-0" />
              : <div className="w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
            }
            <div className="flex-1 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full bg-[#1A2E4A] hover:bg-[#243D5C] disabled:opacity-60 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                {uploading ? "Uploading…" : "Upload from PC"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }}
              />
              <input
                type="text"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="or type path manually…"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C9A454]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Building name (English)"    value={form.name_en} onChange={(v) => set("name_en", v)} />
          <Field label="Building name (Hakha Chin)" value={form.name_hk} onChange={(v) => set("name_hk", v)} />
        </div>
        <Field label="Short caption (English)"    value={form.caption_en} onChange={(v) => set("caption_en", v)} textarea rows={2} />
        <Field label="Short caption (Hakha Chin)" value={form.caption_hk} onChange={(v) => set("caption_hk", v)} textarea rows={2} />
        <Field label="Full history (English) — shown when building is clicked"    value={form.history_en} onChange={(v) => set("history_en", v)} textarea rows={6} />
        <Field label="Full history (Hakha Chin) — shown when building is clicked" value={form.history_hk} onChange={(v) => set("history_hk", v)} textarea rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Memorial Buildings</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} building{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Add Building
        </button>
      </div>

      {status === "saved" && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Saved successfully</p>}
      {errorMsg && <p className="text-red-500  text-sm bg-red-50   rounded-lg px-3 py-2 mb-4 break-all">{errorMsg}</p>}

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-2 border-[#C9A454]">
          <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>New Building</h3>
          {FormFields()}
          <div className="flex gap-2">
            <button onClick={addItem}                 className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Add Building</button>
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
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {item.image
                    ? <img src={item.image} alt={item.name_en} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                    : <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="m21 15-5-5L5 21"/>
                        </svg>
                      </div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1A2E4A] text-sm">{item.name_en}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.name_hk}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{item.caption_en}</p>
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
      </div>
    </div>
  );
}
