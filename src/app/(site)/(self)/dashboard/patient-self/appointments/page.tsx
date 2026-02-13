"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import RequestAppointmentDialog, { ClinicOption } from "@/components/appointments/RequestAppointmentDialog";

/* ====== Calendar config ====== */
const SLOT_MIN = 15;
const START_H = 8;
const END_H = 20;
const SLOT_PX = 40;
const shortDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const isoDay = (d: Date) => d.toISOString().split("T")[0];
const t2min = (t: string) => {
  const [hh, mm] = (t || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
  return hh * 60 + mm;
};
const spanByTimes = (start: string, end: string) =>
  Math.max(1, Math.ceil((t2min(end) - t2min(start)) / SLOT_MIN));

function buildTimeSlots() {
  const out: string[] = [];
  for (let h = START_H; h < END_H; h++) {
    for (let m = 0; m < 60; m += SLOT_MIN) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}
const TIME_SLOTS = buildTimeSlots();

type DoctorOpt = { id: string; label: string };

export default function PatientSelfCalendarPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const patientEmail = session?.user?.email || "";
  const patientId = (session?.user as any)?.id || "";

  /* ---- Clinics (stable) ---- */
  const [clinicOptions, setClinicOptions] = useState<ClinicOption[]>([]);
  const [resolvedClinicId, setResolvedClinicId] = useState<string | undefined>(
    searchParams?.get("clinicId") || undefined,
  );
  const [resolvedClinicName, setResolvedClinicName] = useState<string | undefined>(undefined);

  /* ---- Doctors filter ---- */
  const [doctors, setDoctors] = useState<DoctorOpt[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");

  /* ---- Appointments & dialog state ---- */
  const [appointments, setAppointments] = useState<any[]>([]);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [reqOpen, setReqOpen] = useState(false);
  const [reqDate, setReqDate] = useState<Date | undefined>(undefined);
  const [reqTime, setReqTime] = useState<string | undefined>(undefined);

  const handleEmptySlotClick = useCallback(
    (payload: { date: Date; time: string }) => {
      setReqDate(payload.date);
      setReqTime(payload.time);
      setReqOpen(true);
    },
    [],
  );

  /* ---- A) İlk açılışda saved clinic ID-ni localStorage-dan bərpa et ---- */
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("patientSelectedClinicId")
        : null;
    if (!resolvedClinicId && saved) {
      setResolvedClinicId(saved);
    }
    // ad sonradan clinicOptions gələndə bərpa olunacaq
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- 1) Linked clinics yüklə (stabil) ---- */
  useEffect(() => {
    (async () => {
      try {
        const qs = new URLSearchParams({
          patientUserId: patientId || "",
          patientEmail: patientEmail || "",
        });
        const r = await fetch(`/api/patient/linked-clinics?${qs.toString()}`, {
          cache: "no-store",
        });
        const j = r.ok ? await r.json() : [];
        const list: ClinicOption[] = (Array.isArray(j) ? j : []).map((c: any) => ({
          id: String(c.id),
          name: String(c.name || "Clinic"),
        }));

        setClinicOptions(list);

        // resolvedClinicId yoxdursa: saved -> list[0]
        if (!resolvedClinicId) {
          const saved =
            typeof window !== "undefined"
              ? localStorage.getItem("patientSelectedClinicId")
              : null;
          if (saved && list.find((x) => x.id === saved)) {
            setResolvedClinicId(saved);
            const m = list.find((x) => x.id === saved);
            setResolvedClinicName(m?.name);
          } else if (list.length > 0) {
            setResolvedClinicId(list[0].id);
            setResolvedClinicName(list[0].name);
          }
        } else {
          // Klinika məlumdursa, adını tap
          const m = list.find((x) => x.id === resolvedClinicId);
          if (m?.name) setResolvedClinicName(m.name);
        }
      } catch {
        setClinicOptions([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, patientEmail]);

  /* ---- 2) Həkim siyahısını clinicId üzrə yüklə ---- */
  useEffect(() => {
    (async () => {
      if (!resolvedClinicId) {
        setDoctors([]);
        return;
      }
      try {
        const r = await fetch(
          `/api/doctors?clinicId=${encodeURIComponent(resolvedClinicId)}`,
          { cache: "no-store" },
        );
        const j = r.ok ? await r.json() : [];
        const list: DoctorOpt[] = (Array.isArray(j) ? j : [])
          .map((d: any) => {
            const id = d.id ?? d.userId ?? d.doctorId ?? d.profileId;
            const nm = d.fullName || d.name || "";
            return id ? { id: String(id), label: String(nm || "Doctor") } : null;
          })
          .filter(Boolean) as DoctorOpt[];
        setDoctors(list);
      } catch {
        setDoctors([]);
      }
    })();
  }, [resolvedClinicId]);

  /* ---- 3) Appointment-ları yüklə ---- */
  useEffect(() => {
    (async () => {
      try {
        const from = isoDay(currentDate);
        const toD = new Date(currentDate);
        toD.setDate(toD.getDate() + 7);
        const to = isoDay(toD);

        const qs = new URLSearchParams({ from, to });
        if (resolvedClinicId) qs.set("clinicId", resolvedClinicId);
        if (selectedDoctor !== "all") qs.set("doctorId", selectedDoctor);
        if (!resolvedClinicId && patientEmail) qs.set("patientEmail", patientEmail);

        const res = await fetch(`/api/clinic/appointments?${qs.toString()}`, {
          cache: "no-store",
        });
        const data = res.ok ? await res.json() : [];

        const normalized = (Array.isArray(data) ? data : []).map((a: any) => ({
          id: a.id,
          dateISO:
            typeof a.date === "string" ? a.date.split("T")[0] : isoDay(new Date(a.date)),
          startTime: a.startTime ?? a.time ?? "",
          endTime: a.endTime ?? "",
          durationMin:
            typeof a.duration === "number"
              ? a.duration
              : typeof a.duration === "string"
              ? parseInt(a.duration || "0", 10)
              : 30,
          patientName: "Busy",
          doctorName: a.doctor?.fullName ?? "Doctor",
        }));
        setAppointments(normalized);
      } catch (e) {
        console.error("Patient calendar fetch failed:", e);
      }
    })();
  }, [resolvedClinicId, patientEmail, currentDate, selectedDoctor]);

  /* ---- UI helpers ---- */
  function EventCard({ appt, top }: { appt: any; top: number }) {
    const start = appt.startTime;
    const span = appt.endTime
      ? spanByTimes(start, appt.endTime)
      : Math.max(1, Math.ceil(appt.durationMin / SLOT_MIN));
    const height = span * SLOT_PX;
    return (
      <div
        className="absolute left-1 right-1 rounded-md border bg-white shadow p-2 leading-tight pointer-events-none"
        style={{ top, height }}
        title={`${appt.doctorName}`}
      >
        <div className="pointer-events-none">
          <div className="font-medium text-sm">{appt.patientName}</div>
          <div className="text-xs text-muted-foreground">{appt.doctorName}</div>
        </div>
      </div>
    );
  }

  function DayGrid({ dayISO, showTime = true }: { dayISO: string; showTime?: boolean }) {
    const dayAppts = appointments.filter((a) => a.dateISO === dayISO);

    const DayColumn = (
      <div className="relative border-l border-r select-none">
        {/* Empty cells → request dialog */}
        <div
          className="grid"
          style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}
        >
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot}
              className="border-b relative hover:bg-muted/70 cursor-pointer"
              style={{ height: SLOT_PX }}
              onClick={() => handleEmptySlotClick({ date: new Date(`${dayISO}T00:00:00Z`), time: slot })}
              title="Request appointment for this time"
            />
          ))}
        </div>

        {/* Existing appointments (Busy) */}
        <div className="absolute inset-0 pointer-events-none">
          {dayAppts.map((a) => {
            const idx = TIME_SLOTS.indexOf(a.startTime);
            if (idx < 0) return null;
            const top = idx * SLOT_PX;
            return <EventCard key={a.id} appt={a} top={top} />;
          })}
        </div>
      </div>
    );

    if (!showTime) return DayColumn;

    return (
      <div className="grid grid-cols-[80px_minmax(200px,1fr)] border-t text-sm">
        <div
          className="grid"
          style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}
        >
          {TIME_SLOTS.map((t) => (
            <div key={t} className="border-b px-2 flex items-start">
              <span className="pt-1 font-medium">{t}</span>
            </div>
          ))}
        </div>
        {DayColumn}
      </div>
    );
  }

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    const dow = start.getDay();
    const diffToMon = (dow === 0 ? -6 : 1) - dow;
    start.setDate(start.getDate() + diffToMon);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/patient-self">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Clinic Calendar</h2>
          <p className="text-sm text-muted-foreground">
            Busy slots are shown; empty cells are free time. Click a free cell to request an appointment.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    new Date(currentDate).setDate(
                      currentDate.getDate() - (view === "week" ? 7 : view === "month" ? 30 : 1),
                    ),
                  ),
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    new Date(currentDate).setDate(
                      currentDate.getDate() + (view === "week" ? 7 : view === "month" ? 30 : 1),
                    ),
                  ),
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Doctor filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Filter by doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {view === "day" && (
            <>
              <div className="col-span-2 grid grid-cols-[80px_minmax(200px,1fr)] bg-muted text-center font-medium py-2 border-b">
                <div>Time</div>
                <div>
                  {currentDate.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </div>
              </div>
              <DayGrid dayISO={isoDay(currentDate)} showTime />
            </>
          )}

          {view === "week" && (
            <>
              <div className="col-span-8 grid grid-cols-[80px_repeat(7,minmax(200px,1fr))] bg-muted text-center font-medium py-2 border-b">
                <div>Time</div>
                {weekDates.map((d, i) => (
                  <div key={i}>
                    {shortDaysOfWeek[i]} {String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[80px_repeat(7,minmax(200px,1fr))] border-t text-sm">
                <div
                  className="grid border-l"
                  style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}
                >
                  {TIME_SLOTS.map((t) => (
                    <div key={t} className="border-b px-2 flex items-start">
                      <span className="pt-1 font-medium">{t}</span>
                    </div>
                  ))}
                </div>
                {weekDates.map((d, i) => (
                  <DayGrid key={i} dayISO={isoDay(d)} showTime={false} />
                ))}
              </div>
            </>
          )}

          {view === "month" && (
            <div className="grid grid-cols-7 gap-1">
              {shortDaysOfWeek.map((d, i) => (
                <div key={i} className="text-sm font-medium text-center py-1">
                  {d}
                </div>
              ))}
              {Array.from(
                { length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() },
                (_, i) => (
                  <div key={i} className="text-sm text-muted-foreground text-center py-1 border rounded">
                    {i + 1}
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request dialog — clinicOptions vasitəsilə stabil, seçim yadda saxlanır */}
      <RequestAppointmentDialog
        open={reqOpen}
        onOpenChange={setReqOpen}
        defaultDate={reqDate}
        defaultTime={reqTime}
        defaultDurationMin={30}
        clinicId={resolvedClinicId}
        clinicName={resolvedClinicName}
        clinics={clinicOptions}
        onClinicChange={(opt) => {
          setResolvedClinicId(opt?.id);
          setResolvedClinicName(opt?.name);
          if (opt?.id) localStorage.setItem("patientSelectedClinicId", opt.id);
        }}
        patientId={patientId}
        patientEmail={patientEmail}   // << YENİ
      />
    </div>
  );
}
