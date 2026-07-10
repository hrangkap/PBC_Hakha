"use client";

import { useEffect, useState } from "react";

type Subscriber = { email: string; date: string };

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/subscribe")
      .then((r) => { if (r.status === 401) { window.location.href = "/admin"; return null; } return r.ok ? r.json() : []; })
      .then((d) => { if (d) setSubscribers(d); setLoading(false); });
  }, []);

  function copyAll() {
    const emails = subscribers.map((s) => s.email).join("\n");
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: "Inter, sans-serif" }}>Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading…" : `${subscribers.length} subscriber${subscribers.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        {subscribers.length > 0 && (
          <button onClick={copyAll}
            className="bg-[#1A2E4A] hover:bg-[#243D5C] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
            {copied ? "✓ Copied!" : "Copy All Emails"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400 text-sm">Loading…</div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <p className="text-4xl mb-3">✉️</p>
          <p className="text-gray-500 text-sm">No subscribers yet. Share your website so people can subscribe!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={s.email} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3.5 font-medium text-[#1A2E4A]">{s.email}</td>
                  <td className="px-6 py-3.5 text-gray-400">
                    {new Date(s.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
