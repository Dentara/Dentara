"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, addMinutes, set, startOfToday, parse } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 20;
const SLOT_STEP_MIN = 15;

function buildTimeSlots() {
  const slots: string[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_STEP_MIN) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

const DURATION_PRESETS = ["15", "30", "45", "60", "90", "Custom"];

export default function AddAppointmentPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { data: session } = useSession();

  const [patients, setPatients] = useState<Option[]>([]);
  const [doctors, setDoctors] = useState<Option[]>([]);

  const [patientId, setPatientId] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("30");
  const [customDuration, setCustomDuration] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeSlots = useMemo(buildTimeSlots, []);

  // Prefill (calendar-dan gəlibsə)
  useEffect(() => {
    const d = search.get("date");   // YYYY-MM-DD
    const t = search.get("time");   // HH:mm
    const e = search.get("endTime");// HH:mm
    if (d) {
      const parsed = parse(d, "yyyy-MM-dd", new Date());
      if (!Number.isNaN(parsed.getTime())) setDate(parsed);
    }
    if (t) setTime(t);
    if (e) {
      const ms = (h: string) => {
        const [hh, mm] = h.split(":").map(Number);
        return hh * 60 + mm;
      };
      const diff = ms(e) - ms(t || "00:00");
      if (diff > 0) setDuration(String(diff));
    }
  }, [search]);

  // Patients — /api/patients
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/patients", { cache: "no-store" });
        const data = res.ok ? await res.json() : [];
        const opts = (Array.isArray(data) ? data : []).map((p: any) => {
          const full = p.name ?? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
          return { id: p.id, name: (full || "Unknown").trim() };
        }).filter((x: any) => !!x.id && !!x.name);
        setPatients(opts);
      } catch {
        setPatients([]);
      }
    })();
  }, []);

  // Doctors — /api/doctors
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" });
        const data = res.ok ? await res.json() : [];
        const opts = (Array.isArray(data) ? data : []).map((d: any) => {
          const full = d.fullName || d.name || `Dr. ${(d.firstName ?? "")} ${(d.lastName ?? "")}`.trim();
          const id = d.id ?? d.userId ?? d.doctorId;
          return id ? { id, name: (full || "Dr. Unknown").trim() } : null;
        }).filter(Boolean) as Option[];
        setDoctors(opts);
      } catch {
        setDoctors([]);
      }
    })();
  }, []);

  function computeStatus(dStr: string, tStr: string) {
    // status: gələcəkdirsə scheduled, keçmişdirsə completed
    const dt = new Date(`${dStr}T${tStr}:00Z`);
    return dt.getTime() > Date.now() ? "scheduled" : "completed";
  }

  function getEndTimeStr(dateObj: Date, startStr: string, durMin: number) {
    const [hh, mm] = startStr.split(":").map(Number);
    const start = set(dateObj, { hours: hh, minutes: mm, seconds: 0, milliseconds: 0 });
    const end = addMinutes(start, durMin);
    return format(end, "HH:mm");
  }

  const canSubmit =
    Boolean(patientId) &&
    Boolean(doctorId) &&
    Boolean(date) &&
    Boolean(time) &&
    !isSubmitting;

  async function handleSubmit() {
    try {
      if (!patientId) { alert("Select a patient."); return; }
      if (!doctorId)  { alert("Select a doctor."); return; }
      if (!date || !time) { alert("Select date and time."); return; }

      setIsSubmitting(true);

      const dur =
        (duration === "Custom" ? parseInt(customDuration || "0", 10) : parseInt(duration, 10)) || 30;

      // ✅ Tarixi UTC offset yaratmadan göndər: yalnız YYYY-MM-DD
      const dateStr = format(date!, "yyyy-MM-dd");
      const endTime = getEndTimeStr(date!, time, dur);
      const status = computeStatus(dateStr, time);

      const payload = {
        doctorId,
        patientId,
        date: dateStr,        // <-- yalnız "YYYY-MM-DD"
        time,                 // "HH:mm"
        endTime,              // "HH:mm"
        duration: String(dur),
        reason,
        status,
        notes,
        room,
        type: "",
      };

      const res = await fetch("/api/clinic/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        alert(`Create failed: ${res.status}`);
        console.error("[AddAppointment] create failed:", res.status, txt);
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard/appointments/calendar");
    } catch (err) {
      console.error("[AddAppointment] unexpected error:", err);
      alert("Unexpected error while creating appointment.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Appointment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Patient */}
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.length === 0 ? (
                  <SelectItem value="__none" disabled>No patients found</SelectItem>
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
                  <SelectItem value="__none" disabled>No doctors found</SelectItem>
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

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < startOfToday()}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_PRESETS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {duration === "Custom" && (
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 75"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Optional fields */}
          <div className="space-y-2">
            <Label>Room</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="pt-2">
            <Button onClick={handleSubmit} className="w-full" disabled={!canSubmit}>
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
