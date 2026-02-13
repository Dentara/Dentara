export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import MyPatientsClient from "@/components/doctor/MyPatientsClient";
import DoctorAddPatientButton from "@/components/doctor/DoctorAddPatientButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = {
  id: string;
  name: string | null;
  email: string | null;
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return null;

  // Doctor context (clinicId varsa klinika pasiyentləri, yoxdursa fallback)
  let clinicId: string | null = null;
  try {
    const doc = await prisma.doctor.findFirst({
      where: { email: u.email || "" },
      select: { id: true },
    });
    clinicId = doc?.clinicId ?? null;
  } catch {}

  let rows: Row[] = [];

  if (clinicId) {
    // 1) Klinika ilə bağlı pasiyentlər (ClinicPatient → Patient)
    const cps = await prisma.clinicPatient.findMany({
      where: { clinicId },
      select: {
        patient: { select: { id: true, name: true, email: true } },
        patientId: true,
      },
      take: 2000,
    });
    rows = cps
      .map((x) => x.patient || { id: x.patientId!, name: null, email: null })
      .filter((x): x is Row => !!x?.id);
  } else {
    // 2) Klinika yoxdursa → həkimin keçmiş müalicələrindən pasiyentləri çıxar
    // Doctor.id-ni sessiyadan resolve et (email və ya userId ilə), sonra doctorId ilə axtar
    let doctorId: string | null = null;
    try {
      const doc = await prisma.doctor.findFirst({
        where: {
          OR: [
            u.email ? { email: u.email } : undefined,
            // əgər sxemdə userId yoxdur, bu branch sadəcə skip olunacaq
            (u.id ? ({ userId: u.id } as any) : undefined),
          ].filter(Boolean) as any,
        },
        select: { id: true },
      });
      doctorId = doc?.id ?? null;
    } catch {}

    const tret = await prisma.treatmentEntry.findMany({
      where: {
        OR: [
          doctorId ? { doctorId } : undefined,                 // birbaşa id ilə
          u.email ? { doctor: { email: u.email } } : undefined // fallback: email ilə relation filter
        ].filter(Boolean) as any,
      },
      select: { patient: { select: { id: true, name: true, email: true } } },
      orderBy: { date: "desc" },
      take: 3000,
    });

    const map = new Map<string, Row>();
    for (const t of tret) {
      const p = t.patient;
      if (p?.id && !map.has(p.id)) map.set(p.id, { id: p.id, name: p.name, email: p.email });
    }
    rows = Array.from(map.values());
  }

  // Header info (clinic linked?)
  const linked = !!clinicId;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Patients</h1>
          <p className="text-sm text-muted-foreground">
            {linked ? "Patients linked to your clinic." : "Patients from your past treatments. Link to a clinic to see full patient list."}
          </p>
        </div>

        {/* Klinika linki yoxdursa — Create patient CTA (linki sonra sənin verdiyin real ünvana dəyişərik) */}
        {!linked && (
          <DoctorAddPatientButton linked={linked} />
        )}
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-0">
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Client-side axtarış/tərtib — rows SSR-dən gəlir */}
          <MyPatientsClient rows={rows} linked={linked} />
        </CardContent>
      </Card>
    </div>
  );
}
