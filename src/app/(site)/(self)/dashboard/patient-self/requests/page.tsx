"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Req = {
  id: string;
  targetType: "clinic" | "doctor";
  clinic?: { id: string; name: string | null } | null;
  doctor?: { id: string; fullName: string | null; email?: string | null } | null;
  targetDoctorEmail?: string | null;
  targetDoctorName?: string | null;
  date: string;
  time: string;
  endTime?: string | null;
  proposedDate?: string | null;
  proposedTime?: string | null;
  proposedEndTime?: string | null;
  reason?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
};

export default function PatientRequestsPage() {
  const { data: session } = useSession();
  const patientEmail = session?.user?.email || "";

  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<string>("");

  const lastSnapshot = useRef<Map<string, string>>(new Map());

  const toYMD = (d?: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate()
    ).padStart(2, "0")}`;
  };

  async function markAllRead() {
    if (!patientEmail) return;
    try {
      await fetch(`/api/patient/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientEmail }),
      });
    } catch {}
  }

  async function load() {
    if (!patientEmail) return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/clinic/appointments/requests?patientEmail=${encodeURIComponent(patientEmail)}`,
        { cache: "no-store" }
      );
      const list: Req[] = r.ok ? await r.json() : [];

      const curr = new Map<string, string>(
        list.map((x) => [x.id, `${x.status || ""}|${x.proposedTime || ""}|${toYMD(x.date)}|${x.time || ""}`])
      );
      if (lastSnapshot.current.size > 0) {
        for (const [id, sig] of curr) {
          if (lastSnapshot.current.get(id) !== sig) {
            setFlash("Your requests were updated.");
            setTimeout(() => setFlash(""), 3500);
            break;
          }
        }
      }
      lastSnapshot.current = curr;

      setItems(list);
      await markAllRead();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [patientEmail]);

  useEffect(() => {
    if (!patientEmail) return;
    const es = new EventSource(
      `/api/patient/appointments/requests/stream?patientEmail=${encodeURIComponent(patientEmail)}`
    );
    es.onmessage = async () => {
      await load();
      setFlash("Your requests were updated.");
      setTimeout(() => setFlash(""), 3500);
    };
    es.onerror = () => {
      try {
        es.close();
      } catch {}
    };
    return () => {
      try {
        es.close();
      } catch {}
    };
  }, [patientEmail]);

  async function cancelRequest(id: string) {
    if (!confirm("Cancel this request?")) return;
    const r = await fetch(`/api/patient/appointments/requests/${id}/cancel`, { method: "PATCH" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error || `Cancel failed: ${r.status}`);
      return;
    }
    await load();
  }

  async function accept(id: string) {
    const r = await fetch(`/api/patient/appointments/requests/${id}/accept`, { method: "PATCH" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error || `Accept failed: ${r.status}`);
      return;
    }
    await load();
    alert("Proposal accepted. Appointment created.");
  }

  async function decline(id: string) {
    const r = await fetch(`/api/patient/appointments/requests/${id}/decline`, { method: "PATCH" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error || `Decline failed: ${r.status}`);
      return;
    }
    await load();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">My Appointment Requests</h2>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {flash && (
        <div className="rounded-md border border-green-600/30 bg-green-50 text-green-700 px-3 py-2 text-sm">
          {flash}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">You have no requests yet.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Target</th>
                    <th className="py-2 pr-3">Clinic / Doctor</th>
                    <th className="py-2 pr-3">Date &amp; Time</th>
                    <th className="py-2 pr-3">Reason</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => {
                    const hasProposal = !!r.proposedTime || !!r.proposedDate || !!r.proposedEndTime;
                    const isProposed = r.status === "proposed" || hasProposal;

                    const showTime = isProposed
                      ? `${toYMD(r.proposedDate || r.date)} ${r.proposedTime || r.time}${
                          r.proposedEndTime ? "–" + r.proposedEndTime : ""
                        }`
                      : `${toYMD(r.date)} ${r.time}`;

                    return (
                      <tr key={r.id} className="border-b">
                        <td className="py-2 pr-3">{r.targetType === "doctor" ? "Doctor" : "Clinic"}</td>
                        <td className="py-2 pr-3">
                          {r.targetType === "doctor"
                            ? r.doctor?.fullName || r.targetDoctorName || r.targetDoctorEmail || "—"
                            : r.clinic?.name || "—"}
                        </td>
                        <td className="py-2 pr-3">{showTime}</td>
                        <td className="py-2 pr-3">{r.reason ?? "—"}</td>
                        <td className="py-2 pr-3">
                          {isProposed ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold">
                              PROPOSED
                            </span>
                          ) : (
                            <span className="capitalize">{(r.status || "").replace(/_/g, " ")}</span>
                          )}
                        </td>
                        <td className="py-2 pl-3 text-right min-w-[220px]">
                          {isProposed ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" onClick={() => accept(r.id)}>
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => decline(r.id)}>
                                Decline
                              </Button>
                            </div>
                          ) : r.status === "pending" ? (
                            <Button size="sm" variant="destructive" onClick={() => cancelRequest(r.id)}>
                              Cancel
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
