import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CopyableField from "@/components/clinic/CopyableField";

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try { return await p; } catch { return null as any; }
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id as string | undefined;

  // User (safe)
  const me = meId
    ? await safe(
        prisma.user.findUnique({
          where: { id: meId },
          select: { id: true, name: true, email: true, role: true },
        }),
      )
    : null;

  // Clinic entity – əvvəlcə User.id ilə tapmağa çalışırıq, alınmasa ada görə fallback
  let clinic =
    meId
      ? await safe(
          prisma.clinic.findUnique({
            where: { id: meId },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
              website: true,
              country: true,
              city: true,
            },
          }),
        )
      : null;

  if (!clinic && me?.name) {
    clinic = await safe(
      prisma.clinic.findFirst({
        where: { name: { contains: me.name, mode: "insensitive" } },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          website: true,
          country: true,
          city: true,
        },
        orderBy: { name: "asc" },
      }),
    );
  }

  const phone: string | null = (clinic as any)?.phone ?? null;
  const address: string | null = (clinic as any)?.address ?? null;
  const website: string | null = (clinic as any)?.website ?? null;
  const country: string | null = (clinic as any)?.country ?? null;
  const city: string | null = (clinic as any)?.city ?? null;

  // Doctors (safe)
  const doctors =
    (await safe(
      prisma.doctor.findMany({
        where: clinic?.name
          ? { clinic: { name: { contains: clinic.name, mode: "insensitive" } } }
          : me?.name
          ? { clinic: { name: { contains: me.name, mode: "insensitive" } } }
          : undefined,
        select: { id: true, fullName: true, email: true },
        orderBy: { fullName: "asc" },
        take: 50,
      }),
    )) || [];

  // Optional counts
  const doctorsCount = doctors.length;
  const patientsCount =
    (await safe(prisma.clinicPatient.count({ where: clinic?.id ? { clinicId: clinic.id } : undefined }) as any)) ?? null;
  const apptsCount =
    (await safe(prisma.appointment.count({ where: clinic?.id ? { clinicId: clinic.id } : undefined }) as any)) ?? null;
  const filesCount =
    (await safe(prisma.patientFile.count({ where: clinic?.id ? { clinicId: clinic.id } : undefined }) as any)) ?? null;

  const displayName = clinic?.name || me?.name || "Clinic";
  const displayEmail = me?.email || "—";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-tight">{displayName}</h1>
          <p className="text-muted-foreground">{displayEmail}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">Role: {me?.role || "—"}</Badge>
            {clinic?.id ? <Badge>Clinic ID: {clinic.id}</Badge> : <Badge variant="outline">Clinic ID: —</Badge>}
            {me?.id ? <Badge variant="outline">User ID: {me.id}</Badge> : null}
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild><a href="/dashboard/clinic/treatments">Add Treatment</a></Button>
          <Button variant="outline" asChild><a href="/dashboard/clinic/patient-treatments">Patient History</a></Button>
          <Button variant="outline" asChild><a href={`/clinic/${encodeURIComponent(displayName)}`} target="_blank" rel="noreferrer">Public View</a></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total Doctors</CardDescription><CardTitle className="text-3xl">{doctorsCount}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Patients</CardDescription><CardTitle className="text-3xl">{patientsCount ?? "—"}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Appointments</CardDescription><CardTitle className="text-3xl">{apptsCount ?? "—"}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Files</CardDescription><CardTitle className="text-3xl">{filesCount ?? "—"}</CardTitle></CardHeader></Card>
      </div>

      {/* Clinic Identity (incl. phone/address/website if available) */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Identity</CardTitle>
          <CardDescription>Core identifiers and quick copy actions.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <CopyableField label="Clinic Name" value={displayName} />
          <CopyableField label="Clinic ID" value={clinic?.id || ""} />
          <CopyableField label="User ID" value={me?.id || ""} />
          <CopyableField label="Login Email" value={displayEmail} />
          <CopyableField label="Phone" value={phone || ""} />
          <CopyableField label="Address" value={address || ""} />
          <CopyableField
            label="Location"
            value={[city, country].filter(Boolean).join(", ")}
          />
          <CopyableField label="Website" value={website || ""} />
        </CardContent>
      </Card>

      {/* Doctors */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>Doctors associated with this clinic (public listing).</CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No doctors listed.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {doctors.map((d) => (
                <div key={d.id} className="rounded border p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.fullName || "Doctor"}</div>
                    <div className="text-xs text-muted-foreground truncate">{d.email || "—"}</div>
                  </div>
                  {d.fullName ? (
                    <a className="text-blue-600 hover:underline" href={`/doctor/${encodeURIComponent(d.fullName)}`} target="_blank" rel="noreferrer">View</a>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button asChild><a href="/dashboard/appointments">Open Appointments</a></Button>
        <Button variant="secondary" asChild><a href="/dashboard/patient-files">Manage Files</a></Button>
        <Button variant="outline" asChild><a href="/dashboard/doctors">Manage Doctors</a></Button>
        <Button variant="outline" asChild><a href="/dashboard/patients">Patients</a></Button>
      </div>
    </div>
  );
}
