// app/(site)/(self)/dashboard/patient-self/treatments/page.tsx
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TreatmentTable from "@/components/treatment/TreatmentTable";
import ToothChart from "@/components/treatment/ToothChart";
import TreatmentReviewDialog from "@/components/treatment/TreatmentReviewDialog";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/** ---- Pasiyent ID/toplama: email → Patient.id, sonra User.id ilə fallback ---- */
async function resolvePatientIds(session: any): Promise<string[]> {
  const ids: string[] = [];
  const u = session?.user as { id?: string; email?: string } | undefined;
  if (!u) return ids;

  // 1) Patient by email
  if (u.email) {
    const pByEmail = await prisma.patient.findMany({
      where: { email: u.email },
      select: { id: true },
    });
    for (const p of pByEmail) if (p?.id) ids.push(p.id);
  }

  // 2) Patient id == User.id (bəzi sistemlərdə belədir)
  if (u.id) {
    const pById = await prisma.patient.findUnique({
      where: { id: u.id },
      select: { id: true },
    });
    if (pById?.id) ids.push(pById.id);
  }

  // 3) TreatmentEntry-lərdə patientUserId = session.user.id → oradan patientId-ləri topla
  if (u.id) {
    const te = await prisma.treatmentEntry.findMany({
      where: { patientUserId: u.id },
      select: { patientId: true },
      distinct: ["patientId"],
      take: 5000,
    });
    for (const t of te) if (t?.patientId) ids.push(t.patientId);
  }

  // uniq
  return Array.from(new Set(ids));
}

/** ---- Teeth map helperləri (DONE prioritetli, sonra son tarix) ---- */
function buildLatestPerTooth(entries: any[]) {
  const latest = new Map<number, any>();
  const prio = (s: string) => ({ DONE: 0, PLANNED: 1, CANCELLED: 2 }[s] ?? 9);
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
      // ən çox 3 fərqli kateqoriya; varsa endo/rest/prosth önə
      let trimmed = arr.slice(-3);
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

export default async function PatientSelfTreatmentsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const reviewTargetId =
    typeof sp.review === "string" ? (sp.review as string) : undefined;

  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string | undefined;
  const patientIds = await resolvePatientIds(session);

  // ---- Tarixçəni birbaşa Prisma ilə yükle ----
  const where: any = {
    OR: [
      ...(patientIds.length ? [{ patientId: { in: Array.from(new Set(patientIds)) } }] : []),
      ...(userId ? [{ patientUserId: userId }] : []),
    ],
  };

  // include obyektini rola görə qururuq ki, digər tərəflərdə pozulmasın
  const include: any = {
    clinic: { select: { id: true, name: true } },
    doctor: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
    patient: { select: { id: true, name: true, email: true } },
    teeth: {
      select: {
        id: true,
        numberFDI: true,
        arch: true,
        quadrant: true,
        stateAfter: true,
      },
    },
    attachments: {
      select: {
        id: true,
        patientFile: {
          select: {
            id: true,
            title: true,
            path: true,
            createdAt: true,
            sizeBytes: true,
            thumbnail: true,
          },
        },
      },
    },
    implants: true,
  };

  if (userId) {
    include.reviews = {
      where: { patientUserId: userId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" as const },
      take: 1, // yalnız ən son review
    };
  }

  const treatments = await prisma.treatmentEntry.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include,
    take: 1000,
  });

  const rows = treatments.map((t: any) => ({
    ...t,
    price: t?.price == null ? null : Number(t.price),
  }));

  const latestPerTooth = buildLatestPerTooth(rows);
  const segmentsMap = buildSegmentsMap(rows);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Treatment History</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Kart görünüşü — read-only */}
          <div className="rounded-md border">
            <div className="px-4 py-3 border-b font-medium">History</div>
            <div className="p-3">
              <TreatmentTable
                items={rows as any}
                variant="cards"
                allowDelete={false}
                showPatientReview
                reviewTargetId={reviewTargetId}
              />
            </div>
          </div>

          {/* Tooth map — sadə kapsul quruluşu */}
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
        </CardContent>
      </Card>
    </div>
  );
}
