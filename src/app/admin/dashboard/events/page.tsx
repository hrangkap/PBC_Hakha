"use client";

import { useEffect, useState } from "react";
import type { EventItem } from "@/lib/content";

// Defined outside component so React doesn't remount on every keystroke
function Field({ label, value, onChange, half }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  half?: boolean;
}) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
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

const EMPTY = { day: "", month: "", time: "", title_en: "", place_en: "", title_hk: "", place_hk: "" };

type FormState = Omit<EventItem, "id">;

export default function EventsPage() {
  const [items, setItems]   = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (Array.isArray(d?.events_items)) setItems(d.events_items); });
  }, []);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function persist(updated: EventItem[]) {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "events_items", data: updated }),
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

  function startEdit(item: EventItem) {
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
    const newItem: EventItem = { id: Date.now().toString(), ...form };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAdd(false);
    setForm(EMPTY);
    persist(updated);
  }

  function FormFields() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Day"               value={form.day}      onChange={(v) => set("day", v)}      half />
        <Field label="Month"             value={form.month}    onChange={(v) => set("month", v)}    half />
        <Field label="Time"              value={form.time}     onChange={(v) => set("time", v)}     half />
        <div className="col-span-1" />
        <Field label="Title (English)"   value={form.title_en} onChange={(v) => set("title_en", v)} />
        <Field label="Title (Hakha Chin)"value={form.title_hk} onChange={(v) => set("title_hk", v)} />
        <Field label="Place (English)"   value={form.place_en} onChange={(v) => set("place_en", v)} />
        <Field label="Place (Hakha Chin)"value={form.place_hk} onChange={(v) => set("place_hk", v)} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Events</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} upcoming event{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Add Event
        </button>
      </div>

      {status === "saved"  && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Saved successfully</p>}
      {errorMsg && <p className="text-red-500  text-sm bg-red-50   rounded-lg px-3 py-2 mb-4 break-all">{errorMsg}</p>}

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-2 border-[#C9A454]">
          <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>New Event</h3>
          {FormFields()}
          <div className="flex gap-2">
            <button onClick={addItem}            className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Add Event</button>
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
                  <button onClick={saveEdit}              className="bg-[#C9A454] text-white font-semibold px-4 py-2 rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1A2E4A] flex flex-col items-center justify-center shrink-0">
                    <p className="text-[#C9A454] text-lg font-bold leading-none">{item.day}</p>
                    <p className="text-white/60 text-[9px] font-bold uppercase">{item.month}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A2E4A] text-sm">{item.title_en}</p>
                    <p className="text-gray-400 text-xs">{item.title_hk} · {item.time} · {item.place_en}</p>
                  </div>
                </div>
                <div className="flex gap-2">
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
