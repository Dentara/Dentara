// app/(self)/dashboard/doctor-self/page.tsx
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import JoinClinicModal from "@/components/self/JoinClinicModal";
import { Badge } from "@/components/ui/badge";
import NotificationDropdown from "@/components/medix/notification-dropdown";
import { OnboardingBanner } from "@/components/onboarding/OnboardingBanner";
import ProfileCompletionBar from "@/components/profile/ProfileCompletionBar";

// ✨ UI polish (struktur saxlanır)
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/profile/SignOutButton";

/** Appointment item tipi — API /api/clinic/appointments cavabına uyğun */
type ApiAppointment = {
  id: string;
  clinicId: string;
  doctorId: string;
  patientId: string;
  date: string;      // ISO və ya "YYYY-MM-DDT00:00:00.000Z"
  time: string;      // "HH:mm"
  endTime?: string | null;
  duration?: string | number | null;
  status?: string | null;
  type?: string | null;
  department?: string | null;
  room?: string | null;
  reason?: string | null;
  notes?: string | null;
  patient?: { id: string; name: string | null; image?: string | null } | null;
  doctor?: { id: string; fullName: string | null; profilePhoto?: string | null } | null;
  clinic?: { id: string; name?: string | null } | null;
};

function fmt(dateLike: string | Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function isoDayUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default async function DoctorSelfDashboard() {
  // --- Auth & Role guard (server-side) ---
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?accountType=doctor");
  if ((session.user as any)?.role !== "doctor") redirect("/auth/signin?accountType=doctor");

  const userId = (session.user as any).id as string | undefined;
  const userEmail = session.user.email ?? "";

  // --- Linked clinics (server DB; dəyişmədən saxlanılıb) ---
  const memberships = userId
    ? await prisma.clinicDoctor.findMany({
        where: { userId },
        include: { clinic: { select: { id: true, name: true, email: true } } },
      })
    : [];

  const firstClinicId = memberships[0]?.clinicId ?? null;

  // --- Doctor profile (server DB; dəyişmədən saxlanılıb) ---
  const doctorProfile = firstClinicId
    ? await prisma.doctor.findFirst({
        where: { clinicId: firstClinicId, email: userEmail },
        select: { id: true, fullName: true, email: true, clinicId: true },
      })
    : null;

  // --- Upcoming Appointments (API-dən, cookie-forward ilə) ---
  let appts: ApiAppointment[] = [];
  if (doctorProfile?.id) {
    const now = new Date();
    const from = isoDayUTC(now);

    const qs = new URLSearchParams({ doctorId: doctorProfile.id, from });
    if (firstClinicId) qs.set("clinicId", firstClinicId);

    const hdr = await headers();
    const origin =
      (hdr.get("x-forwarded-proto") && hdr.get("host"))
        ? `${hdr.get("x-forwarded-proto")}://${hdr.get("host")}`
        : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    // ✅ cookie-forward → auth itirməsin
    const res = await fetch(`${origin}/api/clinic/appointments?${qs.toString()}`, {
      cache: "no-store",
      headers: { cookie: hdr.get("cookie") || "" },
    });

    if (res.ok) {
      const data = (await res.json()) as ApiAppointment[] | any;
      const list = Array.isArray(data) ? data : [];
      list.sort((a: ApiAppointment, b: ApiAppointment) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        if (da !== db) return da - db;
        return String(a.time || "").localeCompare(String(b.time || ""));
      });
      appts = list.slice(0, 10);
    } else {
      appts = [];
    }
  }

  // --- Mini KPI-lar (server-side hesablanır) ---
  const todayStr = isoDayUTC(new Date());
  const appointmentsTotal = appts.length;
  const appointmentsToday = appts.filter((x) => {
    const d = typeof x.date === "string" ? x.date : new Date(x.date).toISOString();
    return d.slice(0, 10) === todayStr;
  }).length;
  const uniquePatients = new Set(appts.map((x) => x.patient?.id).filter(Boolean)).size;

  return (
    <div className="p-6 space-y-8">
      {/* Header — struktur saxlanılır, yalnız UI artırıldı */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Doctor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your daily overview — stats, quick actions and clinic links.</p>
        </div>
        <div className="flex items-center gap-2">
          <SignOutButton />
          {/* @ts-expect-error server-to-client */}
          <JoinClinicModal triggerLabel="Join Clinic" defaultMode="inviteCode" />
          <NotificationDropdown scope="doctor" />
        </div>
      </div>

      <OnboardingBanner
        targetHref="/dashboard/doctor-self/onboarding"
        roleHint="doctor"
      />
      
      <ProfileCompletionBar />

      {/* ====== Stats (struktur saxlanıb, Card-larla premium vizual) ====== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Appointments (Upcoming)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{appointmentsTotal}</div></CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Today</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{appointmentsToday}</div></CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Unique Patients</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{uniquePatients}</div></CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Links</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Button asChild size="sm" variant="outline"><Link href="/dashboard/doctor-self/appointments">Open Calendar</Link></Button>
              <Button asChild size="sm" variant="outline"><Link href="/dashboard/doctor-self/requests">My Requests</Link></Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* My Profile — eyni məlumat, daha təmiz vizual */}
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-medium mb-2">My Profile</h2>
        <div className="text-sm grid gap-2 sm:grid-cols-3">
          <div><div className="text-muted-foreground">Name</div><div className="font-medium">{doctorProfile?.fullName ?? (session.user.name ?? "—")}</div></div>
          <div><div className="text-muted-foreground">Email</div><div className="font-medium truncate">{userEmail || "—"}</div></div>
          <div><div className="text-muted-foreground">Status</div><div className="font-medium">Active</div></div>
        </div>
      </section>

      {/* Linked Clinics — struktur saxlanılıb */}
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-medium mb-2">Linked Clinics</h2>
        {memberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clinic linked yet.</p>
        ) : (
          <ul className="text-sm pl-0 space-y-2">
            {memberships.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-lg border p-2">
                <div>
                  <div className="font-medium">{m.clinic?.name ?? m.clinicId}</div>
                  <div className="text-xs text-muted-foreground">{m.clinic?.email ?? "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{m.role ?? "member"}</Badge>
                  <Badge className="text-xs" variant={m.status === "ACTIVE" ? "default" : m.status === "INVITED" ? "secondary" : "outline"}>
                    {m.status ?? "—"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming Appointments — API ilə gətirilən siyahı (struktur saxlanılıb) */}
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-medium mb-2">Upcoming Appointments</h2>
        {(!doctorProfile?.id || appts.length === 0) ? (
          <p className="text-sm text-muted-foreground">No upcoming appointments found.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {appts.map((a) => (
              <div key={a.id} className="rounded border p-2">
                <div><b>Patient:</b> {a.patient?.name ?? "—"}</div>
                <div><b>Clinic:</b> {a.clinic?.name ?? "—"}</div>
                <div><b>Date:</b> {fmt(a.date)} {a.time ? `• ${a.time}` : ""}</div>
                <div><b>Status:</b> {a.status ?? "scheduled"}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
