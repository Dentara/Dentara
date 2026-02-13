// app/(site)/(self)/dashboard/doctor-self/patient-treatments/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function resolveDoctor(session: any) {
  const u = session?.user as any;
  if (!u) return null;

  // priority: explicit doctorId → email → id
  let doc =
    (u?.doctorId &&
      (await prisma.doctor.findUnique({
        where: { id: u.doctorId },
        select: { id: true, clinicId: true },
      }))) ||
    (u?.email &&
      (await prisma.doctor.findFirst({
        where: { email: u.email },
        select: { id: true, clinicId: true },
      }))) ||
    (u?.id &&
      (await prisma.doctor.findUnique({
        where: { id: u.id },
        select: { id: true, clinicId: true },
      })));

  return doc;
}

export default async function DoctorSelfPatientsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const doctor = await resolveDoctor(session);
  if (!doctor) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Treatment History (Doctor)</CardTitle>
          </CardHeader>
          <CardContent>Doctor account not linked.</CardContent>
        </Card>
      </div>
    );
  }

  // YALNIZ bu həkimin müalicə etdiyi pasiyentlər (distinct patientId)
  const treated = await prisma.treatmentEntry.findMany({
    where: { doctorId: doctor.id },
    distinct: ["patientId"],
    select: {
      patientId: true,
      patient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Fallback: əgər həkimin hələ müalicəsi yoxdursa, klinikadakı pasiyentlərdən göstərə bilərik (optional).
  // Burada plain göstərmirik ki, siyahı yalnız doktorun pasiyentləri olsun.

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinic — Patient Treatment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border p-3">
            <div className="font-medium mb-2">Patient list</div>
            {treated.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No patients yet. Add a treatment first.
              </div>
            ) : (
              <div className="grid gap-2">
                {treated.map((row) => {
                  const p = row.patient!;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {p.name || "Unnamed Patient"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {p.email}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/doctor-self/patient-treatments/${p.id}`}
                        className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-muted"
                      >
                        Open History
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
