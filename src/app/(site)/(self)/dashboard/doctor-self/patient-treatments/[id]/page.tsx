// app/(site)/(self)/dashboard/doctor-self/patient-treatments/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClinicTreatmentFiltersClient from "@/components/treatment/ClinicTreatmentFiltersClient";
import TreatmentTable from "@/components/treatment/TreatmentTable";
import ToothChart, { TOOTHCHART_VERSION } from "@/components/treatment/ToothChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// ---- helper: doctor konteksti ----
async function resolveDoctor(session: any) {
  const u = session?.user as any;
  if (!u) return null;

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

/* =======================
   Teeth-map helpers (ALL STATUS)
   Prioritet: DONE > PLANNED > CANCELLED
======================= */
function buildLatestPerTooth(entries: any[]) {
  const latest = new Map<number, any>();
  const prio = (s: string) => ({ DONE: 0, PLANNED: 1, CANCELLED: 2 }[s] ?? 9);

  // tarixə görə artan sırala — sonrakı e yazılan qalacaq
  const byDate = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const e of byDate) {
    const s = String(e?.status || "").toUpperCase();
    for (const t of e.teeth || []) {
      const n = Number(t.numberFDI ?? t.number);
      if (!n) continue;

      const cur = latest.get(n);
      if (!cur) {
        latest.set(n, e);
        continue;
      }
      const cd = new Date(cur.date).getTime();
      const nd = new Date(e.date).getTime();
      if (nd > cd) {
        latest.set(n, e);
      } else if (nd === cd) {
        const cs = String(cur.status || "").toUpperCase();
        if (prio(s) < prio(cs)) latest.set(n, e);
      }
    }
  }
  return latest;
}

// eyni diş üzrə ən çox 3 fərqli kateqoriya (son tarixlər üstün, amma varsa ENDODONTIC/RESTORATIVE/PROSTHETIC önə çəkilir)
function buildSegmentsMap(entries: any[]) {
  const seg = new Map<number, string[]>();
  const byDate = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const e of byDate) {
    const cat = String(e?.category || "OTHER").toUpperCase();
    for (const t of e.teeth || []) {
      const n = Number(t.numberFDI ?? t.number);
      if (!n) continue;

      const arr = seg.get(n) || [];
      if (!arr.includes(cat)) arr.push(cat);

      let trimmed = arr.slice(-3);
      // varsa (endo/restorativ/prostetik) ilk zolağa gətir
      const ix = trimmed.findIndex(
        (c) => c === "ENDODONTIC" || c === "RESTORATIVE" || c === "PROSTHETIC"
      );
      if (ix > 0) {
        const d = trimmed.splice(ix, 1)[0];
        trimmed.unshift(d);
      }
      seg.set(n, trimmed);
    }
  }
  return seg;
}

export default async function DoctorSelfPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params; // Next.js 15 – await params
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const doctor = await resolveDoctor(session);
  if (!doctor?.id) notFound();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true },
  });
  if (!patient) notFound();

  // Müalicələr
  const treatments = await prisma.treatmentEntry.findMany({
    where: { patientId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
      clinic: { select: { id: true, name: true } },
      teeth: { select: { numberFDI: true } },
      attachments: {
        select: {
          id: true,
          patientFile: {
            select: {
              id: true,
              title: true,
              path: true,
              thumbnail: true,
              createdAt: true,
              sizeBytes: true,
            },
          },
        },
      },
    },
    take: 500,
  });

  // Prisma Decimal → number
  const rows = treatments.map((t: any) => ({
    ...t,
    price: t.price == null ? null : Number(t.price),
  }));

  // Teeth map məlumatları (ALL STATUS)
  const latestPerTooth = buildLatestPerTooth(rows);
  const segmentsMap = buildSegmentsMap(rows);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinic — Treatment History (Patient)</CardTitle>
          <div className="text-[10px] text-muted-foreground">Using {TOOTHCHART_VERSION}</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ClinicTreatmentFiltersClient
            mode="history"
            fixedPatientId={patientId}
            fixedDoctorId={doctor.id}
            contextRole="doctor"
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Kart görünüşü */}
            <div className="lg:col-span-2">
              <div className="rounded-md border">
                <div className="px-4 py-3 border-b font-medium">Treatment History</div>
                <div className="p-3">
                  <TreatmentTable items={rows as any} variant="cards" allowDelete={true} />
                </div>
              </div>
            </div>

            {/* Legend + Tooth map */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-md border">
                <div className="px-4 py-3 border-b font-medium">Legend</div>
                <div className="p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sky-500 inline-block" /> Exam / Preventive</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-blue-600 inline-block" /> Restorative</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-violet-600 inline-block" /> Endodontic</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-emerald-600 inline-block" /> Periodontic</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-amber-600 inline-block" /> Prosthetic (Crown / Bridge)</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-orange-500 inline-block" /> Orthodontic</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-rose-600 inline-block" /> Surgical / Implant</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-gray-300 inline-block" /> Other / No data</div>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="px-4 py-3 border-b font-medium">Teeth map (latest)</div>
                <div className="p-4">
                  <ToothChart
                    readOnly
                    latestMap={Object.fromEntries(latestPerTooth)}
                    segmentsMap={Object.fromEntries(segmentsMap)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
