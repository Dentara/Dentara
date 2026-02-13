"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  clinicId?: string | null;

  // Prefill from calendar cell/drag
  defaultDate?: string; // "YYYY-MM-DD"
  defaultTime?: string; // "HH:mm"
  defaultEndTime?: string; // "HH:mm" (optional)

  // Parent doctor filter (if any)
  selectedDoctorId?: string;

  // Callback for parent to refresh calendar
  onCreated?: () => void;
};

/* ===== helpers (no external deps) ===== */
const toMin = (t: string) => {
  const [hh, mm] = (t || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
  return hh * 60 + mm;
};
const minToTime = (m: number) => {
  const mod = ((m % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = String(Math.floor(mod / 60)).padStart(2, "0");
  const mm = String(mod % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

// Helper: backend-dən gələn cavabı müxtəlif formalarda oxu
function normalizeArrayPayload(data: any, keys: string[] = []): any[] {
  if (Array.isArray(data)) return data;
  for (const k of keys) {
    const v = (data as any)?.[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

export default function QuickCreateAppointmentDialog({
  open,
  onOpenChange,
  clinicId,
  defaultDate,
  defaultTime,
  defaultEndTime,
  selectedDoctorId,
  onCreated,
}: Props) {
  const [patients, setPatients] = useState<Option[]>([]);
  const [doctors, setDoctors] = useState<Option[]>([]);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [dateStr, setDateStr] = useState(defaultDate || "");
  const [timeStr, setTimeStr] = useState(defaultTime || "");
  const [durationMin, setDurationMin] = useState(30);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = !!patientId && !!doctorId && !!dateStr && !!timeStr;

  /* --- reset on open --- */
  useEffect(() => {
    if (!open) return;
    setPatientId("");
    setDoctorId(
      selectedDoctorId && selectedDoctorId !== "all" ? selectedDoctorId : ""
    );
    setDateStr(defaultDate || "");
    setTimeStr(defaultTime || "");
    if (defaultTime && defaultEndTime) {
      const diff = Math.max(15, toMin(defaultEndTime) - toMin(defaultTime));
      setDurationMin(diff);
    } else {
      setDurationMin(30);
    }
    setReason("");
    setNotes("");
  }, [open, defaultDate, defaultTime, defaultEndTime, selectedDoctorId]);

  /* --- load patients (when dialog opens) --- */
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/patients", { cache: "no-store" });
        const data = res.ok ? await res.json() : [];
        // həm [] həm də {items:[...]} / {patients:[...]} formalarını dəstəklə
        const rawList = normalizeArrayPayload(data, ["items", "patients"]);
        const list = rawList
          .map((p: any) => {
            const full =
              p.name ??
              `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() ??
              "";
            return p.id
              ? { id: String(p.id), name: (full || "Unknown").trim() }
              : null;
          })
          .filter(Boolean) as Option[];
        setPatients(list);
      } catch {
        setPatients([]);
      }
    })();
  }, [open]);

  /* --- load doctors (when dialog opens) --- */
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" });
        const data = res.ok ? await res.json() : [];
        // həm [] həm də {items:[...]} / {doctors:[...]} formalarını dəstəklə
        const rawList = normalizeArrayPayload(data, ["items", "doctors"]);
        const list = rawList
          .map((d: any) => {
            const id = d.id ?? d.userId ?? d.doctorId;
            const nm =
              d.fullName ||
              d.name ||
              `Dr. ${(d.firstName ?? "")} ${(d.lastName ?? "")}`.trim();
            return id
              ? { id: String(id), name: (nm || "Doctor").trim() }
              : null;
          })
          .filter(Boolean) as Option[];
        setDoctors(list);
      } catch {
        setDoctors([]);
      }
    })();
  }, [open]);

  async function handleCreate() {
    try {
      if (!canSubmit) return;
      const endTime = minToTime(toMin(timeStr) + durationMin);

      const payload = {
        clinicId: clinicId || undefined, // backend ehtiyac duyarsa
        doctorId,
        patientId,
        date: dateStr, // "YYYY-MM-DD"
        time: timeStr, // start
        endTime, // computed
        reason,
        type: "",
        notes,
        status: "scheduled",
      };

      const resp = await fetch("/api/clinic/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        console.error("Create failed:", resp.status, txt);
        alert("Create failed");
        return;
      }

      onOpenChange(false);
      onCreated?.();
    } catch (e) {
      console.error(e);
      alert("Unexpected error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                placeholder="HH:mm"
              />
            </div>
          </div>

          {/* Patient */}
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No patients found
                  </SelectItem>
                ) : (
                  patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor */}
          <div className="space-y-2">
            <Label>Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No doctors found
                  </SelectItem>
                ) : (
                  doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={15}
              step={15}
              value={durationMin}
              onChange={(e) =>
                setDurationMin(
                  Math.max(15, parseInt(e.target.value || "0", 10))
                )
              }
            />
            <div className="text-xs text-muted-foreground">
              End time:&nbsp;
              <span className="font-medium">
                {timeStr ? minToTime(toMin(timeStr) + durationMin) : "--:--"}
              </span>
            </div>
          </div>

          {/* Reason / Notes */}
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
