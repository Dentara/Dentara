import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import JoinClinicModal from "@/components/self/JoinClinicModal";
import { Badge } from "@/components/ui/badge";
import { OnboardingBanner } from "@/components/onboarding/OnboardingBanner";
import ProfileCompletionBar from "@/components/profile/ProfileCompletionBar";

// NEW (UI upgrades)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SignOutButton from "@/components/profile/SignOutButton";

/** API cavabı üçün tip (qısa) */
type ApiAppointment = {
  id: string;
  date: string;           // ISO və ya "YYYY-MM-DDT00:00:00.000Z"
  time?: string | null;   // "HH:mm"
  status?: string | null;
  clinic?:  { id: string; name?: string | null } | null;
  doctor?:  { id: string; fullName?: string | null } | null;
  patient?: { id: string; name?: string | null } | null;
  reason?: string | null;
};

function fmt(dateLike: string | Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default async function PatientSelfDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?accountType=patient");
  if ((session.user as any)?.role !== "patient") redirect("/auth/signin?accountType=patient");

  const userId = (session.user as any).id as string | undefined;
  const userEmail = session.user.email ?? "";
  const userName = session.user.name ?? "—";
  const userRole = ((session.user as any)?.role ?? "patient") as string;

  // Linked clinics count (SSR)
  let linkedClinicsCount = 0;
  try {
    const hdr = await headers();
    const proto = hdr.get("x-forwarded-proto");
    const host = hdr.get("host");
    const origin =
      (proto && host) ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const qs = new URLSearchParams();
    if (userId) qs.set("patientUserId", userId);
    if (userEmail) qs.set("patientEmail", userEmail);

    const r = await fetch(`${origin}/api/patient/linked-clinics?${qs}`, {
      cache: "no-store",
      headers: { cookie: hdr.get("cookie") || "" },
    });
    const j = r.ok ? await r.json() : [];
    if (Array.isArray(j)) linkedClinicsCount = j.length;
  } catch {}

  // 1) Primary — userId ilə linklənən klinikalar (-> My Clinics)
  const linksByUser = userId
    ? await prisma.clinicPatient.findMany({
        where: { patientUserId: userId },
        include: { clinic: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  // 2) Fallback — hələ linklənməyən legacy email-lər
  const linksByEmail =
    linksByUser.length === 0 && userEmail
      ? await prisma.clinicPatient.findMany({
          where: { email: userEmail },
          include: { clinic: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [];

  const clinicLinks = linksByUser.length ? linksByUser : linksByEmail;

  // --- Upcoming Appointments — artıq API-dən gətirilir (patientEmail filtri ilə) ---
  let appts: ApiAppointment[] = [];
  if (userEmail) {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const from = `${y}-${m}-${d}`;

    const hdr = await headers();
    const origin =
      (hdr.get("x-forwarded-proto") && hdr.get("host"))
        ? `${hdr.get("x-forwarded-proto")}://${hdr.get("host")}`
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Birincil klinika məlumdursa, əlavə edə bilərik (opsional).
    // Bir neçə klinikaya linkli ola biləcəyi üçün bu parametri məcburi ETMİRƏM.
    // Əgər filtrasiya daralsın desən, buraya clinicId də əlavə edərik.
    // if (clinicLinks[0]?.clinicId) qs.set("clinicId", clinicLinks[0].clinicId);
    const qs = new URLSearchParams({
      patientEmail: userEmail,
      from,
    });
// Əgər specific klinikaya sıxmaq istəyirsənsə, bunu aç:
/// if (clinicLinks[0]?.clinicId) qs.set("clinicId", clinicLinks[0].clinicId);
    const res = await fetch(`${origin}/api/clinic/appointments?${qs.toString()}`, {
      cache: "no-store",
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
      appts = list.slice(0, 5);
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patient Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your account overview, clinics and appointments.</p>
        </div>
        <div className="flex items-center gap-2">
          <SignOutButton />
          {/* Join Clinic trigger (client modal) */}
          {/* @ts-expect-error Server to Client boundary */}
          <JoinClinicModal triggerLabel="Join Clinic" defaultMode="clinicEmail" />
        </div>
      </div>

      <OnboardingBanner
        targetHref="/dashboard/patient-self/onboarding"
        roleHint="patient"
      />

      <ProfileCompletionBar />
      
      {/* NEW — Unified avatar header (reads User.avatarUrl if present) */}
      <ProfileHeader
        name={userName}
        email={userEmail}
        role={userRole}
        linkedClinicsCount={linkedClinicsCount}
      />

      {/* NEW — Stats + Quick actions (clinic/files/appointments) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>My Clinics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">Clinics connected to your account.</div>
            <Button asChild size="sm" variant="outline"><Link href="/dashboard/patient-self/clinics">Manage</Link></Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>My Files</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">View and download your X-Rays and photos.</div>
            <Button asChild size="sm" variant="outline"><Link href="/dashboard/patient-self/files">Open Files</Link></Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">Schedule or request a new appointment.</div>
            <Button asChild size="sm" variant="outline"><Link href="/dashboard/patient-self/appointments">Open Calendar</Link></Button>
          </CardContent>
        </Card>
      </div>

      {/* ↓↓↓ Sənin mövcud bölmələrin eynilə davam edir (My Profile / My Clinics / Upcoming) */}
      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium mb-2">My Profile</h2>
        <div className="text-sm space-y-1">
          <div><b>Email:</b> {userEmail || "—"}</div>
          <div><b>Status:</b> Active</div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium mb-2">My Clinics</h2>
        {clinicLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clinic linked to your account yet.</p>
        ) : (
          <ul className="text-sm pl-0 space-y-2">
            {clinicLinks.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border p-2">
                <div>
                  <div className="font-medium">{c.clinic?.name ?? c.clinicId}</div>
                  <div className="text-xs text-muted-foreground">{c.clinic?.email ?? "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-xs"
                    variant={c.status === "ACTIVE" ? "default" : c.status === "INVITED" ? "secondary" : "outline"}
                  >
                    {c.status ?? "—"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium mb-2">Upcoming Appointments</h2>
        {appts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming appointments found.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {appts.map((a) => (
              <div key={a.id} className="rounded border p-2">
                <div><b>Clinic:</b> {a.clinic?.name ?? "—"}</div>
                <div><b>Doctor:</b> {a.doctor?.fullName ?? "—"}</div>
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
