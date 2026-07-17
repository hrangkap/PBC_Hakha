"use client";

import { useEffect, useState } from "react";
import type { SermonItem } from "@/lib/content";

// Defined outside component so React doesn't remount on every keystroke
function Field({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]"
      />
    </div>
  );
}

const EMPTY = { title_en: "", title_hk: "", speaker: "", scripture: "", date: "" };

type FormState = Omit<SermonItem, "id">;

export default function SermonsPage() {
  const [items, setItems]     = useState<SermonItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [status, setStatus]   = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (Array.isArray(d?.sermons_items)) setItems(d.sermons_items); });
  }, []);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function persist(updated: SermonItem[]) {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "sermons_items", data: updated }),
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

  function startEdit(item: SermonItem) {
    const { id, ...rest } = item; void id;
    setEditing(item.id);
    setForm(rest);
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
    const newItem: SermonItem = { id: Date.now().toString(), ...form };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAdd(false);
    setForm(EMPTY);
    persist(updated);
  }

  function FormFields() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Title (English)"    value={form.title_en}  onChange={(v) => set("title_en", v)}  />
        <Field label="Title (Hakha Chin)" value={form.title_hk}  onChange={(v) => set("title_hk", v)}  />
        <Field label="Speaker"            value={form.speaker}   onChange={(v) => set("speaker", v)}   />
        <Field label="Scripture reference"value={form.scripture} onChange={(v) => set("scripture", v)} />
        <Field label="Date (e.g. Jun 8, 2025)" value={form.date} onChange={(v) => set("date", v)}      />
        <div />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Sermons</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} sermon{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Add Sermon
        </button>
      </div>

      {status === "saved" && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Saved successfully</p>}
      {errorMsg && <p className="text-red-500  text-sm bg-red-50   rounded-lg px-3 py-2 mb-4 break-all">{errorMsg}</p>}

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-2 border-[#C9A454]">
          <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>New Sermon</h3>
          {FormFields()}
          <div className="flex gap-2">
            <button onClick={addItem}             className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Add Sermon</button>
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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#1A2E4A] text-sm">{item.title_en}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.title_hk}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.speaker} · {item.scripture} · {item.date}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(item)}    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1.5 rounded-lg">Edit</button>
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
