"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

type DoctorOpt = { id: string; label: string };

export default function ClinicRequestsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const clinicId =
    user?.role === "clinic"
      ? (user?.id as string | undefined)
      : (user?.clinicId as string | undefined);

  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(false);

  // approve modal
  const [approveOpen, setApproveOpen] = useState(false);
  const [sel, setSel] = useState<Req | null>(null);
  const [doctorId, setDoctorId] = useState<string>("");
  const [doctors, setDoctors] = useState<DoctorOpt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [durationMin, setDurationMin] = useState<string>("");

  async function load() {
    if (!clinicId) return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/clinic/appointments/requests?clinicId=${clinicId}&status=pending`,
        { cache: "no-store" }
      );
      const j = r.ok ? await r.json() : [];
      setItems(j);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [clinicId]);

  useEffect(() => {
    (async () => {
      if (!clinicId) return;
      const r = await fetch(`/api/doctors?clinicId=${clinicId}`, { cache: "no-store" });
      const j = r.ok ? await r.json() : [];
      const list: DoctorOpt[] = (Array.isArray(j) ? j : [])
        .map((d: any) => {
          const id = d.id ?? d.userId ?? d.doctorId;
          const nm = d.fullName || d.name || "";
          return id ? { id: String(id), label: String(nm || "Doctor") } : null;
        })
        .filter(Boolean) as DoctorOpt[];
      setDoctors(list);
    })();
  }, [clinicId]);

  function toYMD(d: string) {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate()
    ).padStart(2, "0")}`;
  }

  function openApprove(req: Req) {
    setSel(req);
    setDoctorId(req.doctor?.id ?? "");
    setDateStr(toYMD(req.date));
    setTimeStr(req.time); // type="time" value => "HH:mm"
    setEndTime(req.endTime || "");
    setDurationMin("");
    setApproveOpen(true);
  }

  async function doApprove() {
    if (!sel || !clinicId) return;
    const mustHaveDoctor = sel.doctorId || doctorId;
    if (!mustHaveDoctor) {
      alert("Select a doctor to assign.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/clinic/appointments/requests/${sel.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          doctorId: doctorId || sel.doctorId,
          date: dateStr,
          time: timeStr,
          ...(endTime ? { endTime } : {}),
          ...(durationMin ? { durationMin: Number(durationMin) } : {}),
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Appointment Requests</h2>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending requests.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Patient</th>
                    <th className="py-2 pr-3">Target</th>
                    <th className="py-2 pr-3">Doctor</th>
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
                      <td className="py-2 pr-3">{r.targetType === "doctor" ? "Doctor" : "Clinic"}</td>
                      <td className="py-2 pr-3">
                        {r.doctor?.fullName ?? r.targetDoctorName ?? r.targetDoctorEmail ?? "—"}
                      </td>
                      <td className="py-2 pr-3">{toYMD(r.date)}</td>
                      <td className="py-2 pr-3">{r.time}</td>
                      <td className="py-2 pr-3">{r.reason ?? "—"}</td>
                      <td className="py-2 pl-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" onClick={() => openApprove(r)}>
                            Approve
                          </Button>
                          {/* Reject düyməsi sizdəki /reject route ilə işləyir */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              const reason = window.prompt("Rejection reason (optional):") || undefined;
                              const rr = await fetch(`/api/clinic/appointments/requests/${r.id}/reject`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ reason }),
                              });
                              if (!rr.ok) {
                                const j = await rr.json().catch(() => ({}));
                                alert(j?.error || `Reject failed: ${rr.status}`);
                              } else {
                                await load();
                              }
                            }}
                          >
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

      {/* Approve / Propose modal */}
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
                  <Label>Target</Label>
                  <Input value={sel.targetType} readOnly />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} />
                </div>
              </div>

              {sel.notes ? (
                <div className="grid gap-2">
                  <Label>Patient Note</Label>
                  <Input value={sel.notes} readOnly />
                </div>
              ) : null}

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>End Time (optional)</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input placeholder="e.g. 60" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Assign Doctor *</Label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              disabled={submitting || !dateStr || !timeStr}
              onClick={async () => {
                if (!sel) return;
                setSubmitting(true);
                try {
                  const r = await fetch(`/api/clinic/appointments/requests/${sel.id}/propose`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      date: dateStr,
                      time: timeStr, // "HH:mm" göndərilir → DB-də "00:30" və s. saxlanır
                      ...(endTime ? { endTime } : {}),
                    }),
                  });
                  if (!r.ok) {
                    const j = await r.json().catch(() => ({}));
                    throw new Error(j?.error || `Propose failed: ${r.status}`);
                  }
                  setApproveOpen(false);
                  setSel(null);
                  await load();
                } catch (e: any) {
                  alert(e.message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Sending..." : "Propose Time"}
            </Button>
            <Button onClick={doApprove} disabled={submitting || !doctorId}>
              {submitting ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
