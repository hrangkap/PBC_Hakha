"use client";

import { useEffect, useState } from "react";
import type { SeasonTheme } from "@/lib/content";

type ThemeConfig = {
  id: SeasonTheme;
  label: string;
  description: string;
  colors: { primary: string; accent: string; bg: string };
  emoji: string;
  available: boolean;
};

const THEMES: ThemeConfig[] = [
  {
    id: "default",
    label: "Default",
    description: "The standard PBC Hakha theme with navy blue and gold.",
    colors: { primary: "#1A2E4A", accent: "#C9A454", bg: "#F4F5F7" },
    emoji: "⛪",
    available: true,
  },
  {
    id: "christmas",
    label: "Christmas",
    description: "Festive red & green with snowfall and gift ribbon decorations.",
    colors: { primary: "#8B0000", accent: "#2D6A2D", bg: "#FFF8F8" },
    emoji: "🎄",
    available: true,
  },
  {
    id: "good-friday",
    label: "Good Friday",
    description: "Solemn dark purple and grey tones for Good Friday.",
    colors: { primary: "#2D1B4E", accent: "#6B4C8A", bg: "#F5F3F8" },
    emoji: "✝️",
    available: false,
  },
  {
    id: "easter",
    label: "Easter Sunday",
    description: "Joyful sunrise pastels celebrating the resurrection.",
    colors: { primary: "#7B5EA7", accent: "#F4A340", bg: "#FFFBF0" },
    emoji: "🌅",
    available: false,
  },
];

export default function ThemePage() {
  const [activeTheme, setActiveTheme] = useState<SeasonTheme>("default");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (d?.activeTheme) setActiveTheme(d.activeTheme); });
  }, []);

  async function applyTheme(id: SeasonTheme) {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "activeTheme", data: id }),
      });
      if (res.status === 401) { window.location.href = "/admin"; return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setActiveTheme(id);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>
          Seasonal Theme
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose a theme to decorate the website for a season or occasion. The change goes live immediately.
        </p>
      </div>

      {status === "saved"  && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mb-4">✓ Theme applied — the website has been updated.</p>}
      {errorMsg && <p className="text-red-500  text-sm bg-red-50   rounded-lg px-3 py-2 mb-4 break-all">{errorMsg}</p>}
      {status === "saving" && <p className="text-gray-500 text-sm bg-gray-50  rounded-lg px-3 py-2 mb-4">Applying theme…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              className={`relative bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                isActive
                  ? "border-[#C9A454] shadow-md"
                  : theme.available
                  ? "border-transparent hover:border-gray-200 cursor-pointer"
                  : "border-transparent opacity-60"
              }`}
              onClick={() => theme.available && !isActive && applyTheme(theme.id)}
            >
              {isActive && (
                <span className="absolute top-3 right-3 bg-[#C9A454] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
              {!theme.available && (
                <span className="absolute top-3 right-3 bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  COMING SOON
                </span>
              )}

              {/* Color swatches */}
              <div className="flex gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl shadow-sm" style={{ background: theme.colors.primary }} />
                <div className="w-10 h-10 rounded-xl shadow-sm" style={{ background: theme.colors.accent }} />
                <div className="w-10 h-10 rounded-xl shadow-sm border border-gray-100" style={{ background: theme.colors.bg }} />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{theme.emoji}</span>
                <p className="font-bold text-[#1A2E4A] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  {theme.label}
                </p>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{theme.description}</p>

              {theme.available && !isActive && (
                <button
                  onClick={(e) => { e.stopPropagation(); applyTheme(theme.id); }}
                  className="mt-4 w-full bg-[#1A2E4A] hover:bg-[#243D5C] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Apply Theme
                </button>
              )}
              {isActive && (
                <div className="mt-4 w-full bg-[#C9A454]/10 text-[#C9A454] text-xs font-semibold py-2 rounded-lg text-center">
                  Currently Active
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
