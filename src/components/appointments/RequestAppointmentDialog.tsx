"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

export type ClinicOption = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  defaultDate?: Date;
  defaultTime?: string;
  defaultDurationMin?: number;

  clinicId?: string;
  clinicName?: string;
  clinics?: ClinicOption[];
  onClinicChange?: (opt?: ClinicOption) => void;

  patientId: string;         // session user id (istəsənsə saxla)
  patientEmail?: string;     // NEW — server patientId resolution üçün istifadə edir
};

function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const [H, M] = (hhmm || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
  const total = H * 60 + M + (minutes || 0);
  const hh = Math.floor((total % (24 * 60)) / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function RequestAppointmentDialog({
  open, onOpenChange,
  defaultDate, defaultTime, defaultDurationMin = 30,
  clinicId, clinicName, clinics = [], onClinicChange,
  patientId, patientEmail,
}: Props) {
  const [submitting, setSubmitting] = React.useState(false);

  const [reasonText, setReasonText] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  const toYYYYMMDD = (d?: Date) => {
    if (!d) return "";
    const y = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const dd = d.getUTCDate().toString().padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const [dateStr, setDateStr] = React.useState<string>(toYYYYMMDD(defaultDate));
  const [timeStr, setTimeStr] = React.useState<string>(defaultTime ?? "");
  const [endTimeStr, setEndTimeStr] = React.useState<string>(
    defaultTime ? addMinutesToHHMM(defaultTime, defaultDurationMin) : "",
  );

  React.useEffect(() => {
    if (!open) return;
    setDateStr(toYYYYMMDD(defaultDate));
    setTimeStr(defaultTime ?? "");
    setEndTimeStr(defaultTime ? addMinutesToHHMM(defaultTime, defaultDurationMin) : "");
  }, [open, defaultDate, defaultTime, defaultDurationMin]);

  const selectedClinicMissing = !clinicId;

  const canSubmit =
    !!patientId &&
    !!dateStr &&
    !!timeStr &&
    !selectedClinicMissing &&
    reasonText.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload: any = {
        targetType: "clinic",
        clinicId,
        // >>> Patient resolution hints:
        patientId,                 // ola bilər userId — server yoxlayır
        patientEmail,              // NEW
        date: dateStr,
        time: timeStr,
        endTime: endTimeStr || undefined,
        reason: reasonText.trim(),
        notes: notes || undefined,
      };

      const res = await fetch("/api/clinic/appointments/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg = j?.message || j?.error || `Request failed: ${res.status}`;
        alert(msg);
        return;
      }

      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Request Appointment</DialogTitle>
          <DialogDescription>Select clinic and preferred time. We will notify you after confirmation.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target fixed: Clinic */}
          <div className="grid gap-2">
            <Label>Target</Label>
            <Input value="Clinic" readOnly />
          </div>

          {/* Clinic Select */}
          <div className="grid gap-2">
            <Label>Clinic</Label>
            <Select
              value={clinicId ?? ""}
              onValueChange={(v) => {
                const opt = clinics.find((c) => c.id === v);
                onClinicChange?.(opt);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={clinics.length ? "Select clinic" : "No linked clinics"} />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!clinicId && (
              <p className="text-xs text-destructive">No clinic selected. Please choose a clinic.</p>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Date *</Label>
              <Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Time *</Label>
              <Input
                type="time"
                value={timeStr}
                onChange={(e) => {
                  const v = e.target.value;
                  setTimeStr(v);
                  setEndTimeStr(v ? addMinutesToHHMM(v, defaultDurationMin) : "");
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input type="time" value={endTimeStr} readOnly disabled />
            </div>
          </div>

          {/* Reason / Notes */}
          <div className="grid gap-2">
            <Label>Reason *</Label>
            <Input
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Short reason"
            />
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
