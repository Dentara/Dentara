"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import QuickCreateAppointmentDialog from "@/components/appointments/QuickCreateAppointmentDialog";
import AppointmentContextMenu from "@/components/appointments/AppointmentContextMenu";
import { assignLanes } from "@/lib/calendar/lanes";

/* ===== Config ===== */
const SLOT_MIN = 15;     // dəqiqə
const START_H = 8;       // 08:00
const END_H = 20;        // 20:00 (daxil deyil)
const SLOT_PX = 40;      // bir slotun px hündürlüyü
const shortDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DoctorOpt = { id: string; label: string };

function buildTimeSlots() {
  const slots: string[] = [];
  for (let h = START_H; h < END_H; h++) {
    for (let m = 0; m < 60; m += SLOT_MIN) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

const isoDay = (d: Date) => d.toISOString().split("T")[0]; // YYYY-MM-DD
const t2min = (t: string) => {
  const [hh, mm] = (t || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
  return hh * 60 + mm;
};
const spanByTimes = (start: string, end: string) =>
  Math.max(1, Math.ceil((t2min(end) - t2min(start)) / SLOT_MIN));

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function posToTimeInColumn(clientX: number, clientY: number): { dayISO: string; time: string } | null {
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  if (!el) return null;
  const col = el.closest(".tgz-day-col") as HTMLElement | null;
  if (!col) return null;

  const dayISO = col.getAttribute("data-date") || "";
  if (!dayISO) return null;

  const rect = col.getBoundingClientRect();
  const relY = clamp(clientY - rect.top, 0, rect.height);
  const idx = clamp(Math.floor(relY / SLOT_PX), 0, TIME_SLOTS.length - 1);
  const time = TIME_SLOTS[idx];
  return { dayISO, time };
}

export default function CalendarPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const clinicId = (session?.user as any)?.clinicId;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [doctors, setDoctors] = useState<DoctorOpt[]>([]);

  // Quick create dialog state (mövcud axın)
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickDefaults, setQuickDefaults] = useState<{ date?: string; time?: string; endTime?: string }>({});

  // Reschedule təsdiqi (yeni modal)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<{
    apptId: string;
    dayISO: string;
    time: string;
    endTime: string;
    dur: number;
    pretty: string;
  } | null>(null);

  // Drag-to-add seçimi
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const dropLockRef = useRef(false);

  const handleMouseDown = (time: string) => {
    setIsSelecting(true);
    setSelectionStart(time);
    setSelectionEnd(time);
  };
  const handleMouseEnter = (time: string) => {
    if (isSelecting) setSelectionEnd(time);
  };
  const handleMouseUp = (dateISO: string) => {
    if (!isSelecting) return;
    setIsSelecting(false);
    if (selectionStart && selectionEnd) {
      const [start, end] = [selectionStart, selectionEnd].sort();
      setQuickDefaults({ date: dateISO, time: start, endTime: end });
      setQuickOpen(true);
    }
  };

  /* ===== Doctors ===== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" });
        const data = res.ok ? await res.json() : [];
        const opts: DoctorOpt[] = (Array.isArray(data) ? data : [])
          .map((d: any) => {
            const id = d.id ?? d.userId ?? d.doctorId;
            const label = (d.fullName || d.name || `Dr. ${(d.firstName ?? "")} ${(d.lastName ?? "")}`.trim()).trim();
            return id ? { id, label: label || "Doctor" } : null;
          })
          .filter(Boolean) as DoctorOpt[];
        setDoctors(opts);
      } catch {
        setDoctors([]);
      }
    })();
  }, []);

  /* ===== Appointments ===== */
  useEffect(() => {
    (async () => {
      try {
        const from = isoDay(currentDate);
        const toD = new Date(currentDate);
        toD.setDate(toD.getDate() + 7);
        const to = isoDay(toD);

        const qs = new URLSearchParams({ clinicId: clinicId || "", from, to });
        if (selectedDoctor && selectedDoctor !== "all") qs.set("doctorId", selectedDoctor);

        const res = await fetch(`/api/clinic/appointments?${qs.toString()}`, { cache: "no-store" });
        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : []).map((a: any) => {
          const durationMin =
            typeof a.duration === "number"
              ? a.duration
              : typeof a.duration === "string"
              ? parseInt(a.duration || "0", 10)
              : 0;
          return {
            ...a,
            id: a.id,
            startTime: a.startTime ?? a.time ?? "",
            endTime: a.endTime ?? "",
            durationMin: durationMin || 30,
            patientId: a.patient?.id ?? a.patientId ?? a.patient?.patientId ?? null,
            patientName: a.patient?.name ?? a.patientName ?? "Unknown",
            doctorName: a.doctorName ?? a.doctor?.fullName ?? "Doctor",
            dateISO:
              typeof a.date === "string" ? a.date.split("T")[0] : isoDay(new Date(a.date)),
            reason: a.reason ?? "",
          };
        });
        setAppointments(normalized);
      } catch (e) {
        console.error("Failed to fetch appointments:", e);
      }
    })();
  }, [clinicId, currentDate, selectedDoctor, refreshTick]);

  /* ===== Render helpers ===== */
  // --- Reschedule icrasını (PUT + optimistik update) parent səviyyəsinə qaldırdıq
  async function performReschedule(p: { apptId: string; dayISO: string; time: string; endTime: string; dur: number }) {
    try {
      setIsDraggingCard(true);

      // Optimistik UI
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === p.apptId ? { ...a, dateISO: p.dayISO, startTime: p.time, endTime: p.endTime } : a
        )
      );

      const body = {
        date: p.dayISO,
        time: p.time,
        endTime: p.endTime,
        duration: p.dur,
        status: "Rescheduled",
        notify: true, // e-poçt göndər
      };
      const r = await fetch(`/api/clinic/appointments/${p.apptId}/reschedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `Reschedule failed (${r.status})`);
      }
    } catch (err) {
      console.error(err);
      setRefreshTick((t) => t + 1);
    } finally {
      setIsDraggingCard(false);
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      setRefreshTick((t) => t + 1);
    }
  }

  // Drag&Drop: slot-a atılanda görüşü yeni tarix/saat-a keçir (native DnD yolu — qalır)
  async function handleSlotDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (dropLockRef.current) return; // double-drop guard
    dropLockRef.current = true;

    const slotEl = e.currentTarget as HTMLDivElement;
    const apptId = e.dataTransfer?.getData("text/plain");
    const dayISO = slotEl.getAttribute("data-date")!;
    const time = slotEl.getAttribute("data-time")!;
    if (!apptId || !dayISO || !time) {
      dropLockRef.current = false;
      return;
    }

    try {
      let dur = 30;
      try {
        const obj = JSON.parse(e.dataTransfer?.getData("application/json") || "{}");
        if (typeof obj?.durationMin === "number") dur = obj.durationMin;
      } catch {}
      dur = Math.max(SLOT_MIN, Math.round(dur / SLOT_MIN) * SLOT_MIN);

      const [h, m] = (time as string).split(":").map((x) => parseInt(x, 10) || 0);
      const total = h * 60 + m + dur;
      const eh = Math.floor(total / 60) % 24;
      const em = total % 60;
      const endTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

      const body = { date: dayISO, time, endTime, duration: dur };

      const r = await fetch(`/api/clinic/appointments/${apptId}/reschedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `Reschedule failed (${r.status})`);
      }

      // Optimistik: lokali dərhal köçür
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, dateISO: dayISO, startTime: time, endTime } : a))
      );

      // Seçimi təmizlə
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);

      // Serverdən sinxronlaşdır
      setRefreshTick((t) => t + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        dropLockRef.current = false;
      }, 50);
    }
  }

  function EventCard({ appt, top, styleExtra }: { appt: any; top: number; styleExtra?: React.CSSProperties }) {
    const start = appt.startTime ?? appt.time;
    const span = appt.endTime
      ? spanByTimes(start, appt.endTime)
      : Math.max(1, Math.round((appt.durationMin || 30) / SLOT_MIN));
    const height = span * SLOT_PX;

    // === Manual drag state (lokal) ===
    const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

    async function performReschedule(p: { dayISO: string; time: string; endTime: string; dur: number }) {
      try {
        setIsDraggingCard(true);

        // Optimistik UI
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appt.id ? { ...a, dateISO: p.dayISO, startTime: p.time, endTime: p.endTime } : a
          )
        );

        const body = {
          date: p.dayISO,
          time: p.time,
          endTime: p.endTime,
          duration: p.dur,
          status: "Rescheduled",
          notify: true, // e-poçt göndər
        };
        const r = await fetch(`/api/clinic/appointments/${appt.id}/reschedule`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error || `Reschedule failed (${r.status})`);
        }
      } catch (err) {
        console.error(err);
        setRefreshTick((t) => t + 1);
      } finally {
        setIsDraggingCard(false);
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        setRefreshTick((t) => t + 1);
      }
    }

    async function commitReschedule(targetDayISO: string, targetTime: string) {
      // duration hesabı
      const baseDur = appt.endTime ? (t2min(appt.endTime) - t2min(start)) : (appt.durationMin ?? 30);
      let dur = Math.max(SLOT_MIN, Math.round(baseDur / SLOT_MIN) * SLOT_MIN);

      // endTime hesabı
      const [h, m] = targetTime.split(":").map((x) => parseInt(x, 10) || 0);
      const total = h * 60 + m + dur;
      const eh = Math.floor(total / 60) % 24;
      const em = total % 60;
      const endTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

      // --- Təsdiq modalı üçün payload hazırla və aç ---
      const pretty = `${targetDayISO} • ${targetTime}${endTime ? "–" + endTime : ""}`;
      setConfirmPayload({ apptId: appt.id, dayISO: targetDayISO, time: targetTime, endTime, dur, pretty });
      setConfirmOpen(true);
    }

    function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      // Link klikini sürüşdürmədən ayır: linkə klikdə drag başlatma
      const target = e.target as HTMLElement;
      if (target.closest("a")) return;
      // Sağ klik → drag mexanizmini BAŞLATMA. ContextMenu açılacaq, amma naviqasiya etməyəcəyik.
      const btn = (e as any)?.button ?? (e.nativeEvent as any)?.button;
      if (btn === 2) {
        return;
      }
      const el = e.currentTarget as HTMLElement;   // kart elementi
      let captured = false;
      if (el?.setPointerCapture) {
        try { el.setPointerCapture(e.pointerId); captured = true; } catch {}
      }

      dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false };

      const onMove = (ev: PointerEvent) => {
        const ctx = dragRef.current;
        if (!ctx) return;
        const dx = Math.abs(ev.clientX - ctx.startX);
        const dy = Math.abs(ev.clientY - ctx.startY);
        if (dx + dy > 3) ctx.moved = true; // kiçik threshold
      };

      const onUp = async (ev: PointerEvent) => {
        if (captured && el?.releasePointerCapture) {
          try { el.releasePointerCapture(e.pointerId); } catch {}
        }

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        const ctx = dragRef.current;
        dragRef.current = null;

        // Hərəkət yoxdursa → sadə klik: görüş detalına keç
        if (!ctx || !ctx.moved) {
          router.push(`/dashboard/appointments/${appt.id}`);
          return;
        }

        // Hədəf slotu tap və commit et
        const hit = posToTimeInColumn(ev.clientX, ev.clientY);
        if (!hit) return;

        await commitReschedule(hit.dayISO, hit.time);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
    }

    return (
      <AppointmentContextMenu
        apptId={appt.id}
        status={appt.status}
        patientName={appt.patientName}
        doctorName={appt.doctorName}
        onMarkArrived={() =>
          setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, _arrived: true } : a)))
        }
        onMarkCompleted={() =>
          setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, status: "completed" } : a)))
        }
        onCancel={() =>
          setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, status: "cancelled" } : a)))
        }
        onDelete={() => setAppointments((prev) => prev.filter((a) => a.id !== appt.id))}
        onOpenDetails={() => router.push(`/dashboard/appointments/${appt.id}`)}
        onAfterAction={() => setRefreshTick((t) => t + 1)}
      >
        <div
          className="absolute left-0 right-0 rounded-md border bg-white shadow p-2 leading-tight cursor-move z-40 pointer-events-auto select-none"
          style={{ top, height, pointerEvents: isDraggingCard ? "none" : "auto", ...(styleExtra || {}) }}
          onPointerDown={onPointerDown}
          title={`${appt.patientName}${appt.reason ? " • " + appt.reason : ""}`}
        >
        {/* Arrived badge */}
        {(appt.status === "in_progress" || appt.status === "completed") && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-600 text-white text-[11px] font-bold">
            ✓
          </span>
        )}
        {appt.status === "completed" && (
          <span className="absolute top-6 right-1 pointer-events-none inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
            ✓
          </span>
        )}
        <div className="pointer-events-none">
          <div className="font-medium text-sm">
            {appt.patientId ? (
              <Link
                href={`/dashboard/clinic/patient-treatments/${appt.patientId}`}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline"
              >
                {appt.patientName}
              </Link>
            ) : (
              appt.patientName
            )}
          </div>
          <div className="text-xs text-muted-foreground">{appt.doctorName}</div>
          {appt.reason ? <div className="mt-1 text-xs font-medium">{appt.reason}</div> : null}
        </div>
      </div>
      </AppointmentContextMenu>
    );
  }

  function DayHeader({ label }: { label: string }) {
    return (
      <div className="col-span-2 grid grid-cols-[80px_minmax(200px,1fr)] bg-muted text-center font-medium py-2 border-b">
        <div>Time</div>
        <div>{label}</div>
      </div>
    );
  }

  function DayGrid({ dayISO, showTime = true }: { dayISO: string; showTime?: boolean }) {
    // həmin günə aid görüşlər
    const dayAppts = appointments.filter((a) => a.dateISO === dayISO);
    // Overlap bölüşdürmə (yalnız "All Doctors" görünüşündə)
    const maxColumns = 5;
    const laneMap = selectedDoctor === "all"
      ? assignLanes(
          dayAppts.map((a: any) => {
            const start = a.startTime ?? a.time ?? "00:00";
            const end = a.endTime
              ? a.endTime
              : (() => {
                  // durationMin yoxdursa, 30 dəq
                  const dur = Math.max(15, Math.round((a.durationMin || 30) / 15) * 15);
                  const [hh, mm] = start.split(":").map((x: string) => parseInt(x || "0", 10));
                  const total = hh * 60 + mm + dur;
                  const h2 = Math.floor(total / 60) % 24;
                  const m2 = total % 60;
                  return `${String(h2).padStart(2, "0")}:${String(m2).padStart(2, "0")}`;
                })();
            return { id: a.id, start, end };
          }),
          maxColumns
        )
      : new Map();

    // Gün sütunu: grid sıra xəttləri + absolute event layer
    const DayColumn = (
        <div
          className="relative z-20 border-l border-r select-none tgz-day-col"
          data-date={dayISO}
          onMouseUpCapture={() => handleMouseUp(dayISO)} // capture → slot buraxma həmişə tutulur
        >
        {/* Row layer (hover/drag üçün hüceyrələr) */}
        <div className="grid relative z-0" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}>
          {TIME_SLOTS.map((slot) => {
            const isSelected =
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
                className={`border-b ${isSelected ? "bg-blue-200/60" : "hover:bg-muted"} cursor-pointer`}
                style={{ height: SLOT_PX }}
                data-date={dayISO}
                data-time={slot}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleSlotDrop}
                onMouseDown={() => handleMouseDown(slot)}
                onMouseEnter={() => handleMouseEnter(slot)}
                onMouseUp={() => handleMouseUp(dayISO)}
                onClick={(e) => {
                  // boş slota tək klik → 30 dəq default ilə dialog
                  if (isSelecting || isDraggingCard) return;
                  e.stopPropagation();
                  setQuickDefaults({ date: dayISO, time: slot, endTime: "" });
                  setQuickOpen(true);
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

        {/* Event layer (absolute, sütun daxilində) */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {dayAppts.map((appt: any) => {
            const start = appt.startTime ?? appt.time;
            const startIdx = TIME_SLOTS.indexOf(start);
            if (startIdx < 0) return null;
            const top = startIdx * SLOT_PX;
            // Ustdəki lay (pointer-events:none), ancaq kart özü klik/drag alsın deyə onda pointer-events-auto qalır
            const laneInfo = (laneMap as any).get(appt.id);
            let styleExtra: React.CSSProperties | undefined = undefined;
            if (laneInfo) {
              const gap = 4; // px
              const cols = Math.max(1, Math.min(laneInfo.lanesCount, maxColumns));
              const lane = Math.min(laneInfo.lane, cols - 1);
              const widthPct = 100 / cols;
              styleExtra = {
                left: `calc(${lane * widthPct}% + ${gap * (lane + 1)}px)`,
                width: `calc(${widthPct}% - ${gap * (cols + 1)}px)`,
                right: "auto",
              };
            }
            return <EventCard key={appt.id} appt={appt} top={top} styleExtra={styleExtra} />;
          })}
        </div>
      </div>
    );

    if (!showTime) {
      // Yalnız gün sütunu
      return DayColumn;
    }

    // Time + Day sütunu (Day görünüşü üçün)
    return (
      <div className="grid grid-cols-[80px_minmax(200px,1fr)] border-t text-sm">
        {/* Time column */}
        <div className="grid" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)` }}>
          {TIME_SLOTS.map((slot) => (
            <div key={slot} className="border-b px-2 flex items-start">
              <span className="pt-1 font-medium">{slot}</span>
            </div>
          ))}
        </div>
        {/* Day column */}
        {DayColumn}
      </div>
    );
  }

  function renderDayView() {
    const dayISO = isoDay(currentDate);
    const dayLabel = currentDate.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit" });
    return (
      <>
        <DayHeader label={dayLabel} />
        <DayGrid dayISO={dayISO} showTime />
      </>
    );
  }

  function renderWeekView() {
    const start = new Date(currentDate);
    const dow = start.getDay();
    const diffToMonday = (dow === 0 ? -6 : 1) - dow;
    start.setDate(start.getDate() + diffToMonday);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

    return (
      <>
        <div className="col-span-8 grid grid-cols-[80px_repeat(7,minmax(200px,1fr))] bg-muted text-center font-medium py-2 border-b">
          <div>Time</div>
          {weekDates.map((day, index) => (
            <div key={index}>
              {shortDaysOfWeek[index]} {String(day.getDate()).padStart(2, "0")}/{String(day.getMonth() + 1).padStart(2, "0")}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[80px_repeat(7,minmax(200px,1fr))] border-t text-sm">
          {/* Time column — yalnız bir dəfə */}
          <div
            className="grid border-l relative z-0"
            style={{
              gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_PX}px)`,
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                transparent 0,
                transparent ${SLOT_PX - 1}px,
                #e5e7eb ${SLOT_PX - 1}px,
                #e5e7eb ${SLOT_PX}px
              )`,
              backgroundClip: "padding-box",
            }}
          >
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="px-2 flex items-start">
                <span className="pt-1 font-medium">{slot}</span>
              </div>
            ))}
          </div>

          {/* Hər gün üçün YALNIZ day sütunu */}
          {weekDates.map((day, i) => {
            const dayISO = isoDay(day);
            return <DayGrid key={i} dayISO={dayISO} showTime={false} />;
          })}
        </div>
      </>
    );
  }

  function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days = Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1));
    return (
      <div className="grid grid-cols-7 gap-1">
        {shortDaysOfWeek.map((d, i) => (
          <div key={i} className="text-sm font-medium text-center py-1">{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} className="text-sm text-muted-foreground text-center py-1 border rounded">
            {day.getDate()}
          </div>
        ))}
      </div>
    );
  }

  /* ===== UI ===== */
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/appointments">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Calendar</h2>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentDate(new Date(new Date(currentDate).setDate(currentDate.getDate() - (view === "week" ? 7 : view === "month" ? 30 : 1))))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentDate(new Date(new Date(currentDate).setDate(currentDate.getDate() + (view === "week" ? 7 : view === "month" ? 30 : 1))))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {view === "day"
                ? currentDate.toDateString()
                : view === "week"
                ? (() => {
                    const start = new Date(currentDate);
                    const dow = start.getDay();
                    const diffToMonday = (dow === 0 ? -6 : 1) - dow;
                    start.setDate(start.getDate() + diffToMonday);
                    const end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    return `${start.toDateString()} - ${end.toDateString()}`;
                  })()
                : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild>
                <Link href="/dashboard/appointments/add">
                  <Plus className="h-4 w-4 mr-2" /> New
                </Link>
              </Button>
            </div>
          </div>

          {view === "day" && renderDayView()}
          {view === "week" && renderWeekView()}
          {view === "month" && renderMonthView()}
        </CardContent>
      </Card>

      {/* Quick dialog — eyni səhifədə */}
      <QuickCreateAppointmentDialog
        open={quickOpen}
        onOpenChange={setQuickOpen}
        clinicId={clinicId}
        defaultDate={quickDefaults.date}
        defaultTime={quickDefaults.time}
        defaultEndTime={quickDefaults.endTime}
        selectedDoctorId={selectedDoctor}
        onCreated={() => setRefreshTick((t) => t + 1)}
      />

      {/* Reschedule Confirm (qırmızı Confirm, ağ Cancel) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm reschedule</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmPayload ? (
                <>Move this appointment to <b>{confirmPayload.pretty}</b>?</>
              ) : (
                "Are you sure you want to reschedule?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (!confirmPayload) return;
                const p = confirmPayload;
                setConfirmOpen(false);
                setConfirmPayload(null);
                await performReschedule({
                  apptId: p.apptId,
                  dayISO: p.dayISO,
                  time: p.time,
                  endTime: p.endTime,
                  dur: p.dur,
                });
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
