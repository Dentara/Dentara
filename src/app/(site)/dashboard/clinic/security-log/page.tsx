// app/(site)/dashboard/clinic/security-log/page.tsx
"use client";

import { useEffect, useState } from "react";

type SecurityEvent = {
  id: string;
  createdAt: string;
  userId: string | null;
  email: string | null;
  targetUserId: string | null;
  ip: string | null;
  userAgent: string | null;
  action: string;
  details: any;
};

export default function ClinicSecurityLogPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/clinic/security-events?limit=100&days=60", {
          cache: "no-store",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!cancelled) {
            setError(data?.error || "Failed to load security log.");
            setLoading(false);
          }
          return;
        }
        const data = (await res.json()) as { events: SecurityEvent[] };
        if (!cancelled) {
          setEvents(data.events || []);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load security log.");
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security Log</h1>
        <p className="text-sm text-muted-foreground">
          Overview of sensitive account events such as registrations, profile changes and
          password updates.
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading security events…</p>}
      {error && !loading && (
        <p className="text-sm text-red-600">Error loading security events: {error}</p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">IP</th>
                <th className="px-3 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-slate-500 dark:text-slate-400"
                  >
                    No security events recorded for the selected period.
                  </td>
                </tr>
              )}
              {events.map((ev) => {
                const dt = new Date(ev.createdAt);
                const details =
                  ev.details && typeof ev.details === "object"
                    ? JSON.stringify(ev.details)
                    : "";

                return (
                  <tr
                    key={ev.id}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      {isNaN(dt.getTime())
                        ? "—"
                        : dt.toLocaleString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span className="font-mono text-[11px]">{ev.action}</span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col">
                        {ev.email && <span>{ev.email}</span>}
                        {ev.userId && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            userId: {ev.userId}
                          </span>
                        )}
                        {ev.targetUserId && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            targetUserId: {ev.targetUserId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col">
                        <span>{ev.ip || "—"}</span>
                        {ev.userAgent && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs line-clamp-2">
                            {ev.userAgent}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 break-all">
                        {details || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
