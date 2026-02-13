"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import QuickCreateAppointmentDialog from "@/components/appointments/QuickCreateAppointmentDialog";

/* ====== Config (Clinic Calendar ilə eyni ölçülər) ====== */
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

export default function DoctorSelfCalendarPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const clinicId = (session?.user as any)?.clinicId as string | undefined;
  const userEmail = session?.user?.email || "";

  const [doctorId, setDoctorId] = useState<string>("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // QuickCreate
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickDefaults, setQuickDefaults] = useState<{ date?: string; time?: string; endTime?: string }>({});

  // Drag-select
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  /* ---- Həkimin öz id-sini müəyyən et (email ilə) ---- */
  useEffect(() => {
    (async () => {
      try {
        // Sadə yol: /api/doctors-dan öz emailinə uyğun həkimi tap
        const res = await fetch("/api/doctors", { cache: "no-store" });
        const list = res.ok ? await res.json() : [];
        const me = (Array.isArray(list) ? list : []).find((d: any) => d.email && d.email === userEmail);
        // id prioriteti: d.id -> d.userId -> d.doctorId
        const id = me?.id ?? me?.userId ?? me?.doctorId;
        if (id) setDoctorId(String(id));
      } catch {
        /* ignore */
      }
    })();
  }, [userEmail]);

  /* ---- Appointments (yalnız öz xəstələri) ---- */
  useEffect(() => {
    (async () => {
      if (!doctorId) return;
      try {
        const from = isoDay(currentDate);
        const toD = new Date(currentDate);
        toD.setDate(toD.getDate() + 7);
        const to = isoDay(toD);

        const qs = new URLSearchParams({ from, to });
        if (clinicId) qs.set("clinicId", clinicId);
        qs.set("doctorId", doctorId);

        const res = await fetch(`/api/clinic/appointments?${qs.toString()}`, { cache: "no-store" });
        const data = res.ok ? await res.json() : [];

        const normalized = (Array.isArray(data) ? data : []).map((a: any) => {
          const dur =
            typeof a.duration === "number"
              ? a.duration
              : typeof a.duration === "string"
              ? parseInt(a.duration || "0", 10)
              : 0;
          return {
            id: a.id,
            dateISO: typeof a.date === "string" ? a.date.split("T")[0] : isoDay(new Date(a.date)),
            startTime: a.startTime ?? a.time ?? "",
            endTime: a.endTime ?? "",
            durationMin: dur || 30,
            patientName: a.patient?.name ?? "Unknown",
            doctorName: a.doctor?.fullName ?? "Doctor",
            reason: a.reason ?? "",
          };
        });
        setAppointments(normalized);
      } catch (e) {
        console.error("Doctor calendar fetch failed:", e);
      }
    })();
  }, [clinicId, doctorId, currentDate, refreshTick]);

  /* ---- UI helpers ---- */
  function EventCard({ appt, top }: { appt: any; top: number }) {
    const start = appt.startTime;
    const span = appt.endTime ? spanByTimes(start, appt.endTime) : Math.max(1, Math.ceil(appt.durationMin / SLOT_MIN));
    const height = span * SLOT_PX;

    return (
      <div
        className="absolute left-1 right-1 rounded-md border bg-white shadow p-2 leading-tight cursor-pointer pointer-events-auto"
        style={{ top, height }}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/dashboard/appointments/${appt.id}`);
        }}
        title={`${appt.patientName}${appt.reason ? " • " + appt.reason : ""}`}
      >
        <div className="pointer-events-none">
          <div className="font-medium text-sm">{appt.patientName}</div>
          {appt.reason ? <div className="mt-1 text-xs text-muted-foreground">{appt.reason}</div> : null}
        </div>
      </div>
    );
  }

  function DayGrid({ dayISO, showTime = true }: { dayISO: string; showTime?: boolean }) {
    const dayAppts = appointments.filter((a) => a.dateISO === dayISO);

    const DayColumn = (
      <div
        className="relative border-l border-r select-none"
        onMouseUp={() => {
          if (!isSelecting) return;
          setIsSelecting(false);
          if (selectionStart && selectionEnd) {
            const [start, end] = [selectionStart, selectionEnd].sort();
            setQuickDefaults({ date: dayISO, time: start, endTime: end });
            setQuickOpen(true);
          }
        }}
      >
        <div className="grid" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}>
          {TIME_SLOTS.map((slot) => {
            const isSel =
              isSelecting && selectionStart && selectionEnd &&
              (() => {
                const i = TIME_SLOTS.indexOf(slot);
                const s = TIME_SLOTS.indexOf(selectionStart);
                const e = TIME_SLOTS.indexOf(selectionEnd);
                return i >= Math.min(s, e) && i <= Math.max(s, e);
              })();

            return (
              <div
                key={slot}
                className={`border-b relative ${isSel ? "bg-blue-200/60" : "hover:bg-muted"} cursor-pointer`}
                style={{ height: SLOT_PX }}
                onMouseDown={() => {
                  setIsSelecting(true);
                  setSelectionStart(slot);
                  setSelectionEnd(slot);
                }}
                onMouseEnter={() => {
                  if (isSelecting) setSelectionEnd(slot);
                }}
                onClick={(e) => {
                  if (!isSelecting) {
                    e.stopPropagation();
                    setQuickDefaults({ date: dayISO, time: slot, endTime: "" });
                    setQuickOpen(true);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setQuickDefaults({ date: dayISO, time: slot, endTime: "" });
                  setQuickOpen(true);
                }}
              />
            );
          })}
        </div>

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
        <div className="grid" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}>
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
          <Link href="/dashboard/doctor-self">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">My Calendar</h2>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(new Date(currentDate).setDate(currentDate.getDate() - (view === "week" ? 7 : view === "month" ? 30 : 1))))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(new Date(currentDate).setDate(currentDate.getDate() + (view === "week" ? 7 : view === "month" ? 30 : 1))))}>
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

            <Button asChild>
              <Link href="/dashboard/appointments/add">
                <Plus className="h-4 w-4 mr-2" /> New
              </Link>
            </Button>
          </div>

          {view === "day" && (
            <>
              <div className="col-span-2 grid grid-cols-[80px_minmax(200px,1fr)] bg-muted text-center font-medium py-2 border-b">
                <div>Time</div>
                <div>{currentDate.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit" })}</div>
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
                <div className="grid border-l" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}>
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
                <div key={i} className="text-sm font-medium text-center py-1">{d}</div>
              ))}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => (
                <div key={i} className="text-sm text-muted-foreground text-center py-1 border rounded">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuickCreateAppointmentDialog
        open={quickOpen}
        onOpenChange={setQuickOpen}
        clinicId={clinicId}
        defaultDate={quickDefaults.date}
        defaultTime={quickDefaults.time}
        defaultEndTime={quickDefaults.endTime}
        selectedDoctorId={doctorId}
        onCreated={() => setRefreshTick((t) => t + 1)}
      />
    </div>
  );
}
