"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Req = {
  id: string;
  targetType: "clinic" | "doctor";
  clinicId?: string | null;
  doctorId?: string | null;
  targetDoctorEmail?: string | null;
  targetDoctorName?: string | null;
  patient: { id: string; name: string; email?: string | null };
  clinic?: { id: string; name: string | null } | null;
  doctor?: { id: string; fullName: string | null; email?: string | null } | null;
  date: string;
  time: string;
  endTime?: string | null;
  reason?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
};

export default function DoctorRequestsPage() {
  const { data: session } = useSession();
  const doctorId = (session?.user as any)?.id as string | undefined;

  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(false);

  // Approve dialog
  const [approveOpen, setApproveOpen] = useState(false);
  const [sel, setSel] = useState<Req | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!doctorId) return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/clinic/appointments/requests?doctorId=${doctorId}&status=pending`,
        { cache: "no-store" },
      );
      const j = r.ok ? await r.json() : [];
      setItems(j);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [doctorId]);

  function openApprove(req: Req) {
    setSel(req);
    setApproveOpen(true);
  }

  async function doApprove() {
    if (!sel) return;
    if (!doctorId) return;
    if (!sel.clinicId) {
      alert("This request has no clinic context; ask clinic to approve.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/clinic/appointments/requests/${sel.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: sel.clinicId,  // request-in klinikası
          doctorId,                // özünə təyin et
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `Approve failed: ${r.status}`);
      }
      setApproveOpen(false);
      setSel(null);
      await load();
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function doReject(req: Req) {
    const reason = window.prompt("Rejection reason (optional):") || undefined;
    try {
      const r = await fetch(`/api/clinic/appointments/requests/${req.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `Reject failed: ${r.status}`);
      }
      await load();
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    }
  }

  // Real-time badge üçün SSE (həkim konteksti)
  const [pendingCount, setPendingCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    if (!doctorId) {
      setPendingCount(0);
      return;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    const url = `/api/clinic/appointments/requests/stream?doctorId=${encodeURIComponent(doctorId)}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data || "{}");
        if (typeof data.count === "number") setPendingCount(data.count);
      } catch {}
    };
    es.onerror = () => {
      try { es.close(); } catch {}
      esRef.current = null;
      setTimeout(() => {
        if (!esRef.current && doctorId) {
          const retry = new EventSource(`/api/clinic/appointments/requests/stream?doctorId=${encodeURIComponent(doctorId)}`);
          esRef.current = retry;
          retry.onmessage = es.onmessage;
          retry.onerror = es.onerror;
        }
      }, 2000);
    };
    return () => {
      try { es.close(); } catch {}
      esRef.current = null;
    };
  }, [doctorId]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">My Appointment Requests</h2>
        <div className="flex items-center gap-2">
          <Badge variant={pendingCount > 0 ? "destructive" : "secondary"} className="rounded-full">
            Pending: {pendingCount}
          </Badge>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">You have no pending requests.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Patient</th>
                    <th className="py-2 pr-3">Clinic</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Reason</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-3">{r.patient?.name ?? "—"}</td>
                      <td className="py-2 pr-3">{r.clinic?.name ?? "—"}</td>
                      <td className="py-2 pr-3">{new Date(r.date).toISOString().slice(0, 10)}</td>
                      <td className="py-2 pr-3">{r.time}</td>
                      <td className="py-2 pr-3">{r.reason ?? "—"}</td>
                      <td className="py-2 pl-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" onClick={() => openApprove(r)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => doReject(r)}>
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
          </DialogHeader>

          {sel && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Patient</Label>
                  <Input value={sel.patient?.name ?? "—"} readOnly />
                </div>
                <div>
                  <Label>Clinic</Label>
                  <Input value={sel.clinic?.name ?? "—"} readOnly />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input value={new Date(sel.date).toISOString().slice(0, 10)} readOnly />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input value={sel.time} readOnly />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                This will create a scheduled appointment assigned to you.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={doApprove} disabled={submitting || !sel?.clinicId}>
              {submitting ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
