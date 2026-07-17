"use client";

import { useEffect, useRef, useState } from "react";
import type { BulletinItem } from "@/lib/content";

const EMPTY = { title: "", date: "", files: [] as string[] };
type FormState = Omit<BulletinItem, "id">;

export default function BulletinsPage() {
  const [items, setItems]         = useState<BulletinItem[]>([]);
  const [editing, setEditing]     = useState<string | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [status, setStatus]       = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (Array.isArray(d?.bulletin_items)) setItems(d.bulletin_items); });
  }, []);

  function setField(key: "title" | "date", value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImages(fileList: FileList) {
    setUploading(true);
    setErrorMsg("");
    const uploaded: string[] = [];
    const errors: string[] = [];
    for (const file of Array.from(fileList)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "bulletins");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
        if (data.path) uploaded.push(data.path);
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
    }
    if (errors.length > 0) setErrorMsg(errors.join(" · "));
    setForm((prev) => ({ ...prev, files: [...prev.files, ...uploaded] }));
    setUploading(false);
  }

  function removeFile(index: number) {
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  }

  async function persist(updated: BulletinItem[]) {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "bulletin_items", data: updated }),
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

  function startEdit(item: BulletinItem) {
    setEditing(item.id);
    setForm({ title: item.title ?? "", date: item.date ?? "", files: item.files ?? [] });
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
    const newItem: BulletinItem = { id: Date.now().toString(), ...form };
    const updated = [newItem, ...items];
    setItems(updated);
    setShowAdd(false);
    setForm(EMPTY);
    persist(updated);
  }

  function FormFields() {
    const cls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]";
    return (
      <div className="space-y-4 mb-4">
        {/* Text fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Title (Hakha Chin)</label>
            <input type="text" value={form.title} onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Pa Ni — Men Sunday" className={cls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
            <input type="text" value={form.date} onChange={(e) => setField("date", e.target.value)}
              placeholder="e.g. 2026 Pur (June) 14" className={cls} />
          </div>
        </div>

        {/* Image uploader */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Pages / Images ({form.files.length} uploaded)
          </label>

          {/* Uploaded thumbnails */}
          {form.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.files.map((src, i) => (
                <div key={i} className="relative group w-16 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt={`page ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <span className="absolute bottom-0.5 left-0 right-0 text-center text-white text-[9px] font-bold bg-black/30">
                    p.{i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-[#1A2E4A] hover:bg-[#243D5C] disabled:opacity-60 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {uploading ? "Uploading…" : "Upload Images"}
          </button>
          <span className="ml-2 text-xs text-gray-400">You can select multiple files at once</span>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) uploadImages(e.target.files); e.target.value = ""; }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Sunday Bulletins</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} bulletin{items.length !== 1 ? "s" : ""} · newest first</p>
        </div>
        <button onClick={startAdd}
          className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          + Add Bulletin
        </button>
      </div>

      {status === "saved" && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Saved successfully</p>}
      {errorMsg && <p className="text-red-500  text-sm bg-red-50   rounded-lg px-3 py-2 mb-4 break-all">{errorMsg}</p>}

      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-2 border-[#C9A454]">
          <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>New Bulletin</h3>
          {FormFields()}
          <div className="flex gap-2">
            <button onClick={addItem}                 className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Add Bulletin</button>
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
                  <button onClick={saveEdit}               className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnails */}
                  <div className="flex gap-1 shrink-0">
                    {(item.files ?? []).slice(0, 3).map((src, i) => (
                      <img key={i} src={src} alt="" className="w-10 h-14 rounded object-cover border border-gray-100" />
                    ))}
                    {(item.files ?? []).length === 0 && (
                      <div className="w-10 h-14 rounded bg-gray-100" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1A2E4A] text-sm">{item.title || "—"}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.date}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{(item.files ?? []).length} page{(item.files ?? []).length !== 1 ? "s" : ""}</p>
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
            No bulletins yet. Click <strong>+ Add Bulletin</strong> to upload the first one.
          </div>
        )}
      </div>
    </div>
  );
}
