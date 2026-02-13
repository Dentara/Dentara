"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek, addWeeks, subWeeks, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import Link from "next/link";


// ==== Helper for API Fetch (Universal) ====
const useApi = (url: string) => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData([]));
  }, [url]);
  return data;
};

export default function DoctorSchedulePage() {
  // Data
  const doctors = useApi("/api/doctors");
  const appointments = useApi("/api/appointments");

  // States
  const [tab, setTab] = useState("week");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  // --- Memoized Schedules ---
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const timeSlots = useMemo(() =>
    Array.from({ length: 11 }, (_, i) => {
      const hour = 9 + i; // 9:00 - 19:00
      return `${hour.toString().padStart(2, "0")}:00`;
    }), []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (selectedDoctor !== "all" && appt.doctorId !== selectedDoctor) return false;
      return true;
    });
  }, [appointments, selectedDoctor]);

  // --- View Functions ---
  const getSlotAppointments = (date: Date, time: string) => {
    const d = format(date, "yyyy-MM-dd");
    return filteredAppointments.filter(
      (appt) => appt.date === d && appt.time === time
    );
  };

  const renderWeekGrid = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="grid grid-cols-8">
          <div></div>
          {weekDays.map((d, i) => (
            <div key={i} className={`text-center py-2 font-medium ${isSameDay(d, new Date()) ? "text-blue-600 bg-blue-50 rounded-t-md" : ""}`}>
              {format(d, "EEE")}<br />
              <span className="text-sm">{format(d, "MMM d")}</span>
            </div>
          ))}
        </div>
        {/* Time Slots */}
        {timeSlots.map((slot, i) => (
          <div key={i} className="grid grid-cols-8 border-t">
            <div className="text-right pr-2 text-muted-foreground py-2 font-medium">{slot}</div>
            {weekDays.map((day, j) => {
              const appts = getSlotAppointments(day, slot);
              return (
                <div key={j} className={`border-l min-h-[50px] p-1 group hover:bg-blue-50 transition`}>
                  {appts.length > 0 ? appts.map((appt) => (
                    <div key={appt.id}
                      className={`rounded p-2 mb-1 shadow-sm bg-white border-l-4
                        ${appt.status === "Completed" ? "border-green-500" : appt.status === "Cancelled" ? "border-red-500" : "border-blue-500"}
                        flex flex-col gap-1`}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={appt.doctor?.profilePhoto || "/user-2.png"} />
                          <AvatarFallback>{appt.doctor?.fullName?.charAt(0) ?? "?"}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-xs">{appt.patientName}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{appt.type}</span>
                        <Badge variant="outline" className={
                          appt.status === "Completed" ? "border-green-500 text-green-700"
                          : appt.status === "Cancelled" ? "border-red-500 text-red-500"
                          : "border-blue-500 text-blue-500"
                        }>{appt.status}</Badge>
                      </div>
                    </div>
                  )) : <span className="text-xs text-muted-foreground"></span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // --- Month View ---
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    // pad calendar to start on Sunday, fill last row
    const padStart = Array(monthStart.getDay()).fill(null);
    const padEnd = Array(6 - monthEnd.getDay()).fill(null);
    return [...padStart, ...days, ...padEnd];
  }, [monthStart, monthEnd]);

  // --- Main JSX ---
  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Doctor Schedule</h1>
          <p className="text-muted-foreground mb-2">Professional schedule and appointment management for your clinic.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((d: any) =>
                <SelectItem value={d.id} key={d.id}>{d.fullName}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button asChild variant="outline">
            <Link href="/dashboard/appointments/add">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
        </TabsList>

        {/* Week View */}
        <TabsContent value="week" className="space-y-3">
          <div className="flex items-center gap-3 justify-between">
            <Button variant="ghost" size="sm" onClick={() => setWeekStart(subWeeks(weekStart, 1))}><ChevronLeft /></Button>
            <div className="font-medium">{format(weekStart, "MMMM d")} – {format(addDays(weekStart, 6), "MMMM d, yyyy")}</div>
            <Button variant="ghost" size="sm" onClick={() => setWeekStart(addWeeks(weekStart, 1))}><ChevronRight /></Button>
          </div>
          {renderWeekGrid()}
        </TabsContent>

        {/* Month View */}
        <TabsContent value="month">
          <div className="flex items-center gap-3 justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => setMonthDate(subWeeks(monthDate, 4))}><ChevronLeft /></Button>
            <div className="font-medium">{format(monthDate, "MMMM yyyy")}</div>
            <Button variant="ghost" size="sm" onClick={() => setMonthDate(addWeeks(monthDate, 4))}><ChevronRight /></Button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) =>
              <div key={d} className="bg-white py-2 text-xs text-center font-bold text-muted-foreground">{d}</div>
            )}
            {calendarDays.map((d, idx) => (
              <div key={idx} className={`min-h-[80px] p-1 bg-white border
                ${d && isSameMonth(d, monthDate) ? "bg-white" : "bg-muted-foreground/10"}
                ${d && isSameDay(d, new Date()) ? "border-blue-500 ring-2 ring-blue-200" : ""}
              `}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs ${d && isSameDay(d, new Date()) ? "font-bold text-blue-600" : "text-muted-foreground"}`}>{d ? format(d, "d") : ""}</span>
                </div>
                {d && filteredAppointments.filter(appt => appt.date === format(d, "yyyy-MM-dd")).slice(0,2).map(appt =>
                  <div key={appt.id} className="mb-1 rounded px-1 py-0.5 bg-blue-50 text-xs font-medium truncate border-l-4 border-blue-400">{appt.patientName}</div>
                )}
                {d && filteredAppointments.filter(appt => appt.date === format(d, "yyyy-MM-dd")).length > 2 &&
                  <span className="text-xs text-muted-foreground">+{filteredAppointments.filter(appt => appt.date === format(d, "yyyy-MM-dd")).length - 2} more</span>
                }
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Day View */}
        <TabsContent value="day">
          <Card>
            <CardHeader>
              <CardTitle>{format(selectedDay, "EEEE, MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.map((slot, i) => {
                const appts = getSlotAppointments(selectedDay, slot);
                return (
                  <div key={i} className="flex gap-3 items-center border-b py-2 min-h-[45px]">
                    <span className="text-muted-foreground w-20 text-right">{slot}</span>
                    {appts.length > 0 ? appts.map(appt => (
                      <div key={appt.id} className={`rounded p-2 bg-blue-50 border-l-4 border-blue-400 min-w-[160px]`}>
                        <span className="font-medium">{appt.patientName}</span>
                        <span className="ml-2 text-xs">{appt.type}</span>
                        <Badge variant="outline" className="ml-2 border-blue-500 text-blue-500">{appt.status}</Badge>
                      </div>
                    )) : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
