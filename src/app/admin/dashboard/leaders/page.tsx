"use client";

import { useEffect, useRef, useState } from "react";
import type { LeaderItem } from "@/lib/content";

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]" />
    </div>
  );
}

const EMPTY = { image: "", name: "", position_en: "", position_hk: "", term: "", status: "current" as const };
type FormState = Omit<LeaderItem, "id">;

export default function LeadersPage() {
  const [items, setItems]     = useState<LeaderItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (Array.isArray(d?.leaders_items)) {
          setItems(d.leaders_items.map((i: LeaderItem) => ({
            ...i,
            term:        i.term        ?? "",
            image:       i.image       ?? "",
            position_en: i.position_en ?? "",
            position_hk: i.position_hk ?? "",
          })));
        }
      });
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
      fd.append("folder", "leaders");
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

  async function persist(updated: LeaderItem[]) {
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "leaders_items", data: updated }),
      });
      if (res.status === 401) { window.location.href = "/admin"; return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
      setSaveStatus("error");
    }
  }

  function startEdit(item: LeaderItem) {
    setEditing(item.id);
    setForm({
      image:       item.image       ?? "",
      name:        item.name        ?? "",
      position_en: item.position_en ?? "",
      position_hk: item.position_hk ?? "",
      term:        item.term        ?? "",
      status:      item.status      ?? "current",
    });
    setShowAdd(false);
  }

  function startAdd() { setShowAdd(true); setEditing(null); setForm(EMPTY); }

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
    const newItem: LeaderItem = { id: Date.now().toString(), ...form };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAdd(false);
    setForm(EMPTY);
    persist(updated);
  }

  function PhotoPicker() {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Photo</label>
        <div className="flex items-center gap-3">
          {form.image
            ? <img src={form.image} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-[#C9A454]" />
            : <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
          }
          <div className="flex-1 flex flex-col gap-1.5">
            <button type="button" onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full bg-[#1A2E4A] hover:bg-[#243D5C] disabled:opacity-60 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors">
              {uploading ? "Uploading…" : "Upload from PC"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }}
            />
            <input type="text" value={form.image} onChange={(e) => set("image", e.target.value)}
              placeholder="or type path manually…"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C9A454]" />
          </div>
        </div>
      </div>
    );
  }

  function FormFields() {
    return (
      <div className="space-y-3 mb-4">
        {PhotoPicker()}
        <Field label="Full name" value={form.name} onChange={(v) => set("name", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Position (English)"    value={form.position_en} onChange={(v) => set("position_en", v)} />
          <Field label="Position (Hakha Chin)" value={form.position_hk} onChange={(v) => set("position_hk", v)} />
        </div>
        <Field label="Term (e.g. 2005 – 2015  or  2018 – Present)" value={form.term} onChange={(v) => set("term", v)} />
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
          <div className="flex gap-2">
            {(["current", "former"] as const).map((s) => (
              <button key={s} type="button" onClick={() => set("status", s)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${form.status === s ? "bg-[#1A2E4A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {s === "current" ? "Current" : "Former"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const current = items.filter((i) => i.status === "current");
  const former  = items.filter((i) => i.status === "former");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Church Leaders</h1>
          <p className="text-sm text-gray-500 mt-1">{current.length} current · {former.length} former</p>
        </div>
        <button onClick={startAdd}
          className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          + Add Leader
        </button>
      </div>

      {saveStatus === "saved" && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Saved successfully</p>}
      {errorMsg && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4 break-all">{errorMsg}</p>}

      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-2 border-[#C9A454]">
          <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>New Leader</h3>
          {FormFields()}
          <div className="flex gap-2">
            <button onClick={addItem} className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Add Leader</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
            {editing === item.id ? (
              <>
                {FormFields()}
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    : <div className="w-12 h-12 rounded-full bg-[#1A2E4A]/10 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A2E4A" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      </div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1A2E4A] text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.position_en}</p>
                    {item.term && <p className="text-gray-400 text-xs mt-0.5">{item.term}</p>}
                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${item.status === "current" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(item)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1.5 rounded-lg">Edit</button>
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
