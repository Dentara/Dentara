"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar, AvatarFallback, AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle, ArrowLeft, Building, Calendar, CalendarClock, CheckCircle2,
  Clock, FileText, MapPin, Pencil, Stethoscope, User, XCircle,
} from "lucide-react";

type Params = Promise<{ id: string }>;

type Person = {
  id?: string;
  name?: string;        // patient.name
  fullName?: string;    // doctor.fullName / patient.fullName (fallback)
  email?: string;
  phone?: string;
  image?: string;
  profilePhoto?: string;
  specialty?: string;
  birthDate?: string | null;
  address?: string | null;
};

type Appointment = {
  id: string;
  date: string;            // "YYYY-MM-DD"
  time: string;            // "HH:mm"
  endTime?: string;        // "HH:mm"
  duration?: string | number;
  status?: string;
  type?: string;
  department?: string;
  room?: string;
  reason?: string;
  reasonForVisit?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  patient?: Person | null;
  doctor?: Person | null;
};

function safeDateLabel(dateStr?: string) {
  if (!dateStr) return "Unknown";
  // dateStr "YYYY-MM-DD" formatında gəlirsə onu toLocale-a çevirməyək (TZ problemi yaratmasın)
  try {
    const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function safeDateTimeLabel(dateStr?: string) {
  if (!dateStr) return "—";
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleString();
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "Confirmed": return <AlertCircle className="shrink-0 h-5 w-5 text-blue-500" />;
    case "In Progress": return <Clock className="shrink-0 h-5 w-5 text-amber-500" />;
    case "Completed": return <CheckCircle2 className="shrink-0 h-5 w-5 text-green-500" />;
    case "Cancelled": return <XCircle className="shrink-0 h-5 w-5 text-red-500" />;
    default: return <AlertCircle className="h-5 w-5" />;
  }
}

function getStatusBadge(status?: string) {
  switch (status) {
    case "Confirmed":
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Confirmed</Badge>;
    case "In Progress":
      return <Badge className="bg-amber-500">In Progress</Badge>;
    case "Completed":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "Cancelled":
      return <Badge className="bg-red-500">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function AppointmentDetailsPage({ params }: { params: Params }) {
  const router = useRouter();
  const { id } = use(params);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/clinic/appointments/${id}`, { cache: "no-store" });
        const data = await res.json();
        // Normalizasiya: reason/doctor/patient fallback-ları
        const appt: Appointment = {
          ...data,
          reason: data.reason ?? data.reasonForVisit ?? "",
          patient: data.patient ?? null,
          doctor: data.doctor ?? null,
        };
        setAppointment(appt);
      } catch (e) {
        console.error("Failed to load appointment", e);
      }
    })();
  }, [id]);

  if (!appointment) {
    return <div className="p-6 text-muted-foreground text-sm">Loading appointment details...</div>;
  }

  const p = appointment.patient ?? {};
  const d = appointment.doctor ?? {};
  const patientName = p.name || p.fullName || "Unknown";
  const doctorName = d.fullName || d.name || "Unknown";
  const patientImg = p.image || p.profilePhoto || "/user-2.png";
  const doctorImg = d.image || (d as any).profilePhoto || "/user-2.png";
  const durationLabel = typeof appointment.duration === "number" ? `${appointment.duration} min` : (appointment.duration || "");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/appointments">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to appointments</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold leading-tight mb-2">Appointment Details</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/appointments/${appointment.id}/reschedule`}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Reschedule
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Appointment
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {getStatusIcon(appointment.status)}
                {appointment.type || "Appointment"}
              </CardTitle>
              <CardDescription>
                Appointment #{appointment.id} • Created on {safeDateTimeLabel(appointment.createdAt)}
              </CardDescription>
            </div>
            {getStatusBadge(appointment.status)}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & time & place */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Date</h3>
                    <p>{safeDateLabel(appointment.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Time</h3>
                    <p>{appointment.time} {appointment.endTime ? `- ${appointment.endTime}` : ""} {durationLabel ? `(${durationLabel})` : ""}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Department</h3>
                    <p>{appointment.department || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p>{appointment.room || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Reason & notes */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Reason for Visit</h3>
                    <p>{appointment.reason || appointment.reasonForVisit || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Notes</h3>
                    <p className="text-sm">{appointment.notes || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
          </CardContent>

          <CardFooter className="text-sm text-muted-foreground">
            Last updated: {safeDateTimeLabel(appointment.updatedAt)}
          </CardFooter>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Patient */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patientImg} alt={patientName} />
                  <AvatarFallback>{patientName?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    DOB: {p.birthDate ? safeDateLabel(p.birthDate) : "Unknown"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <p className="text-sm">{p.address ?? "Unknown"}</p>
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3A2 2 0 0 1 9.1 3.72a12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {p.phone ? <p className="text-sm">{p.phone}</p> : <p className="text-sm text-muted-foreground italic">No phone</p>}
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <p className="text-sm">{p.email ?? "Unknown"}</p>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/patients/${p.id ?? ""}`}>View Patient Record</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctorImg} alt={doctorName} />
                  <AvatarFallback>{doctorName?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{doctorName}</h3>
                  <p className="text-sm text-muted-foreground">{d.specialty ?? "Not specified"}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3A2 2 0 0 1 9.1 3.72a12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <p className="text-sm">{d.phone ?? "—"}</p>
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <p className="text-sm">{d.email ?? "—"}</p>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/doctors/${d.id ?? ""}`}>View Doctor Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
