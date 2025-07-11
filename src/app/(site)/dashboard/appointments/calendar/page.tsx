"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { AppointmentModal } from "@/components/medix/appointment-modal";

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 4) + 8;
  const minutes = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

const shortDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTime, setModalTime] = useState("");
  const [modalDate, setModalDate] = useState("");
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [modalEndTime, setModalEndTime] = useState<string | null>(null);

  const handleMouseDown = (time: string) => {
    setIsSelecting(true);
    setSelectionStart(time);
    setSelectionEnd(time);
  };

  const handleMouseEnter = (time: string) => {
    if (isSelecting) setSelectionEnd(time);
  };

  const handleMouseUp = (date: string) => {
    setIsSelecting(false);

    if (selectionStart && selectionEnd) {
      const times = [selectionStart, selectionEnd].sort();
      setModalDate(date);
      setModalTime(times[0]); // startTime
      setModalEndTime?.(times[1]); // endTime (əgər modal bunu qəbul edirsə)
      setModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments?clinicId=cmbg9438i0000czaialurf01u");
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  const renderDayView = () => {
    const dayLabel = currentDate.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit" });
    return (
      <>
        <div className="col-span-2 grid grid-cols-[80px_minmax(200px,1fr)] bg-muted text-center font-medium py-2 border-b">
          <div>Time</div>
          <div>{dayLabel}</div>
        </div>
        <div className="grid grid-cols-[80px_minmax(200px,1fr)] border-t border-l text-sm">
          <div className="grid grid-rows-48">
            {timeSlots.map((slot) => (
              <div key={slot} className="border-b border-r px-2 py-2 font-medium">{slot}</div>
            ))}
          </div>
          <div className="grid grid-rows-48">
            {timeSlots.map((slot) => {
              const isSelected = isSelecting && selectionStart && selectionEnd && (() => {
                const current = timeSlots.indexOf(slot);
                const start = timeSlots.indexOf(selectionStart);
                const end = timeSlots.indexOf(selectionEnd);
                return current >= Math.min(start, end) && current <= Math.max(start, end);
              })();
              const match = appointments.find(
                (appt) => new Date(appt.date).toDateString() === currentDate.toDateString() && appt.startTime === slot
              );
              return (
                <div
                  key={slot}
                  className={`border-b border-r px-2 py-2 cursor-pointer ${
                    isSelected ? "bg-blue-200" : "hover:bg-muted"
                  }`}
                  onMouseDown={() => handleMouseDown(slot)}
                  onMouseEnter={() => handleMouseEnter(slot)}
                  onMouseUp={() => handleMouseUp(currentDate.toISOString().split("T")[0])}
                >
                  {match ? (
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{match.patientName} ({match.type})</div>
                      <div className="text-xs text-muted-foreground">{match.doctor?.fullName || "Unknown"}</div>
                      <Badge>{match.status}</Badge>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderWeekView = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
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
              {shortDaysOfWeek[index]} {day.getDate().toString().padStart(2, "0")}/{(day.getMonth() + 1).toString().padStart(2, "0")}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[80px_repeat(7,minmax(200px,1fr))] border-t border-l text-sm">
          <div className="grid grid-rows-48">
            {timeSlots.map((slot) => (
              <div key={slot} className="border-b border-r px-2 py-2 font-medium">{slot}</div>
            ))}
          </div>
          {weekDates.map((day, i) => (
            <div key={i} className="grid grid-rows-48">
              {timeSlots.map((slot) => {
                const match = appointments.find(
                  (appt) => new Date(appt.date).toDateString() === day.toDateString() && appt.startTime === slot
                );
                return (
                  <div
                    key={slot}
                    className="border-b border-r px-2 py-2 hover:bg-muted cursor-pointer"
                    onMouseDown={() => handleMouseDown(slot)}
                    onMouseEnter={() => handleMouseEnter(slot)}
                    onMouseUp={() => handleMouseUp(day.toISOString().split("T")[0])}
                  >
                    {match ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{match.patientName} ({match.type})</div>
                        <div className="text-xs text-muted-foreground">{match.doctor?.fullName || "Unknown"}</div>
                        <Badge>{match.status}</Badge>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {shortDaysOfWeek.map((day, index) => (
          <div key={index} className="text-sm font-medium text-center py-1">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="text-sm text-muted-foreground text-center py-1 border rounded">
            {day.getDate()}
          </div>
        ))}
      </div>
    );
  };

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
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Appointment Calendar</h2>
          <p className="text-muted-foreground">View and manage appointments in calendar view.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - (view === "week" ? 7 : view === "month" ? 30 : 1))))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (view === "week" ? 7 : view === "month" ? 30 : 1))))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {view === "day"
                ? currentDate.toDateString()
                : view === "week"
                ? `${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toDateString()} - ${new Date(currentDate.setDate(currentDate.getDate() + 6)).toDateString()}`
                : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
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

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={modalDate || currentDate.toISOString().split("T")[0]}
        defaultTime={modalTime}
        defaultEndTime={modalEndTime}
      />
    </div>
  );