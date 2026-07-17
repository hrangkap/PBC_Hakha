"use client";

import { useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/content";

type FormState = {
  caption_en: string;
  caption_hk: string;
  image: string;
  images: string[];
};

const EMPTY: FormState = { caption_en: "", caption_hk: "", image: "", images: [] };

// ─── AlbumForm at module level so it never remounts on parent re-renders ──────
type AlbumFormProps = {
  form: FormState;
  uploading: boolean;
  uploadProgress: string;
  uploadError: string;
  saveLabel: string;
  onFieldChange: (key: keyof FormState, value: string) => void;
  onUpload: (files: File[]) => void;
  onRemovePhoto: (src: string) => void;
  onSetCover: (src: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

function AlbumForm({
  form, uploading, uploadProgress, uploadError, saveLabel,
  onFieldChange, onUpload, onRemovePhoto, onSetCover, onSave, onCancel,
}: AlbumFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(["caption_en", "caption_hk"] as const).map((key) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {key === "caption_en" ? "Album name (English)" : "Album name (Hakha Chin)"}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => onFieldChange(key, e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A454]"
            />
          </div>
        ))}
      </div>

      {/* Upload trigger */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-200 hover:border-[#C9A454] rounded-xl py-5 text-sm text-gray-500 hover:text-[#C9A454] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? uploadProgress : "Click to select photos (multiple allowed)"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (!e.target.files || e.target.files.length === 0) return;
            const fileArray = Array.from(e.target.files); // snapshot before reset
            e.target.value = "";
            onUpload(fileArray);
          }}
        />
        {uploadError && (
          <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 break-all">{uploadError}</p>
        )}
      </div>

      {/* Photo grid */}
      {form.images.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {form.images.length} photo{form.images.length !== 1 ? "s" : ""} · click a photo to set it as album cover
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {form.images.map((src) => {
              const isCover = form.image === src;
              return (
                <div key={src} className="relative group aspect-square">
                  <img
                    src={src}
                    alt=""
                    onClick={() => onSetCover(src)}
                    className={`w-full h-full object-cover rounded-lg cursor-pointer transition-all ${
                      isCover ? "ring-2 ring-[#C9A454] ring-offset-1" : "hover:opacity-80"
                    }`}
                  />
                  {isCover && (
                    <span className="absolute top-1 left-1 bg-[#C9A454] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none pointer-events-none">
                      COVER
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(src)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={uploading || !form.caption_en.trim()}
          className="bg-[#C9A454] hover:bg-[#b8923e] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  // stable ref so upload folder ID doesn't drift between renders
  const albumFolderRef = useRef<string>("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (Array.isArray(d?.gallery_items)) setItems(d.gallery_items); });
  }, []);

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function persist(updated: GalleryItem[]) {
    setStatus("saving");
    setUploadError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "gallery_items", data: updated }),
      });
      if (res.status === 401) { window.location.href = "/admin"; return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Save failed");
      setStatus("error");
    }
  }

  async function handleUpload(files: File[]) {
    setUploading(true);
    setUploadError("");
    const uploaded: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading ${i + 1} / ${files.length}…`);
      const fd = new FormData();
      fd.append("file", files[i] as Blob);
      fd.append("folder", `gallery/${albumFolderRef.current}`);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.path) {
          uploaded.push(data.path);
        } else {
          errors.push(`${files[i].name}: ${data.error ?? "unknown error"}`);
        }
      } catch (e) {
        errors.push(`${files[i].name}: network error (${e})`);
      }
    }

    setUploading(false);
    setUploadProgress("");
    if (errors.length > 0) setUploadError(errors.join(" · "));
    if (uploaded.length === 0) return;
    setForm((prev) => {
      const next = [...prev.images, ...uploaded];
      return { ...prev, images: next, image: prev.image || next[0] || "" };
    });
  }

  function startAdd() {
    albumFolderRef.current = `new-${Date.now()}`;
    setShowAdd(true);
    setEditing(null);
    setForm(EMPTY);
  }

  function startEdit(item: GalleryItem) {
    albumFolderRef.current = item.id;
    setEditing(item.id);
    setShowAdd(false);
    setForm({ caption_en: item.caption_en, caption_hk: item.caption_hk, image: item.image, images: [...item.images] });
  }

  function deleteItem(id: string) {
    if (!confirm("Delete this album? This removes it from the site but does not delete the image files.")) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    persist(updated);
  }

  function removePhoto(src: string) {
    setForm((prev) => {
      const next = prev.images.filter((p) => p !== src);
      return { ...prev, images: next, image: prev.image === src ? (next[0] ?? "") : prev.image };
    });
  }

  function addAlbum() {
    if (!form.caption_en.trim()) return;
    const newItem: GalleryItem = { id: Date.now().toString(), ...form };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAdd(false);
    setForm(EMPTY);
    persist(updated);
  }

  function saveEdit() {
    const updated = items.map((i) =>
      i.id === editing
        ? { id: i.id, caption_en: form.caption_en, caption_hk: form.caption_hk, image: form.image, images: form.images }
        : i
    );
    setItems(updated);
    setEditing(null);
    persist(updated);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} album{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + New Album
        </button>
      </div>

      {status === "saved"  && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Saved successfully</p>}
      {status === "error"  && <p className="text-red-500  text-sm bg-red-50   rounded-lg px-3 py-2 mb-4 break-all">{uploadError || "Failed to save. Please try again."}</p>}
      {status === "saving" && <p className="text-gray-500 text-sm bg-gray-50  rounded-lg px-3 py-2 mb-4">Saving…</p>}

      {/* New album form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-2 border-[#C9A454]">
          <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>New Album</h3>
          <AlbumForm
            form={form}
            uploading={uploading}
            uploadProgress={uploadProgress}
            saveLabel="Create Album"
            onFieldChange={setField}
            uploadError={uploadError}
            onUpload={handleUpload}
            onRemovePhoto={removePhoto}
            onSetCover={(src) => setField("image", src)}
            onSave={addAlbum}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {/* Album list */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {editing === item.id ? (
              <div className="p-6">
                <h3 className="font-semibold text-[#1A2E4A] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                  Edit: {item.caption_en}
                </h3>
                <AlbumForm
                  form={form}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  uploadError={uploadError}
                  saveLabel="Save Changes"
                  onFieldChange={setField}
                  onUpload={handleUpload}
                  onRemovePhoto={removePhoto}
                  onSetCover={(src) => setField("image", src)}
                  onSave={saveEdit}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4">
                {/* Cover thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.caption_en} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="m21 15-5-5L5 21"/>
                    </svg>
                  )}
                </div>

                {/* Preview strip */}
                {item.images.length > 1 && (
                  <div className="hidden sm:flex gap-1 shrink-0">
                    {item.images.slice(0, 4).map((src, i) => (
                      <img key={i} src={src} alt="" className="w-10 h-10 object-cover rounded-lg opacity-60" />
                    ))}
                    {item.images.length > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-semibold">
                        +{item.images.length - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A2E4A] text-sm">{item.caption_en}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.caption_hk}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.images.length} photo{item.images.length !== 1 ? "s" : ""}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(item)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1.5 rounded-lg">Edit</button>
                  <button onClick={() => deleteItem(item.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 font-semibold px-3 py-1.5 rounded-lg">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm shadow-sm">
            No albums yet. Click <strong>+ New Album</strong> to create one.
          </div>
        )}
      </div>
    </div>
  );
}
