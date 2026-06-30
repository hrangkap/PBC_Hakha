"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content";

const sections = [
  { label: "Hero & Motto", href: "/admin/dashboard/hero", icon: "✦", desc: "Church motto, title, and hero text" },
  { label: "About", href: "/admin/dashboard/about", icon: "◎", desc: "About section content" },
  { label: "Events", href: "/admin/dashboard/events", icon: "◷", desc: "Upcoming events" },
  { label: "Sermons", href: "/admin/dashboard/sermons", icon: "♪", desc: "Recent sermons" },
  { label: "General Settings", href: "/admin/dashboard/general", icon: "⚙", desc: "Service times, footer, contact info" },
];

export default function DashboardPage() {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.events_items) setContent(d); });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage all PBC Hakha website content</p>
      </div>

      {/* Stats */}
      {content && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Events", value: content.events_items.length },
            { label: "Gallery", value: content.gallery_items.length },
            { label: "Languages", value: 2 },
            { label: "Leaders", value: content.leaders_items.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-[#C9A454]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F5EDD8] flex items-center justify-center text-[#C9A454] text-lg mb-4">
              {s.icon}
            </div>
            <h3 className="font-semibold text-[#1A2E4A] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
              {s.label}
            </h3>
            <p className="text-sm text-gray-400">{s.desc}</p>
            <p className="text-xs text-[#C9A454] font-semibold mt-4 group-hover:underline">
              Edit →
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
