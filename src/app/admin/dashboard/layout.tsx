"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { label: "Overview",     href: "/admin/dashboard",           icon: "◈" },
  { label: "Hero & Motto", href: "/admin/dashboard/hero",      icon: "✦" },
  { label: "About",        href: "/admin/dashboard/about",     icon: "◎" },
  { label: "Our Mission",  href: "/admin/dashboard/mission",   icon: "🎯" },
  { label: "Buildings",    href: "/admin/dashboard/buildings", icon: "⌂" },
  { label: "Leaders",      href: "/admin/dashboard/leaders",   icon: "✦" },
  { label: "Gallery",      href: "/admin/dashboard/gallery",   icon: "🖼" },
  { label: "Bulletins",    href: "/admin/dashboard/bulletins", icon: "📋" },
  { label: "Theme",        href: "/admin/dashboard/theme",     icon: "🎨" },
  { label: "Events",       href: "/admin/dashboard/events",    icon: "◷" },
  { label: "General",      href: "/admin/dashboard/general",   icon: "⚙" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F5F7]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
      </div>
    );
  }

  const currentPage = NAV.find((n) =>
    n.href === "/admin/dashboard" ? pathname === n.href : pathname.startsWith(n.href)
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Mobile overlay — closes sidebar on tap outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-60 shrink-0 flex flex-col bg-[#1A2E4A] text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10 shrink-0">
          <img src="/images/church_logo.png" alt="PBC" className="h-9 w-auto" />
          <div>
            <p className="text-white text-sm font-bold leading-none">PBC Hakha</p>
            <p className="text-white/45 text-xs mt-1">Admin Panel</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/admin/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
                  active ? "bg-[#C9A454]" : "hover:bg-white/10"
                }`}
              >
                <span className="w-5 text-center text-base shrink-0">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            <span className="w-5 text-center shrink-0">→</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[#1A2E4A]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <div className="space-y-1.5">
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
            </div>
          </button>
          <img src="/images/church_logo.png" alt="PBC" className="h-7 w-auto" />
          <p className="text-white text-sm font-bold truncate">{currentPage?.label ?? "Admin"}</p>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
