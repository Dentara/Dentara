// app/api/treatments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseDate(v: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Doctor kontekstini tap: doctorId + clinicId */
async function resolveDoctorContext(
  session: any
): Promise<{ doctorId: string | null; clinicId: string | null }> {
  const u = session?.user as any;
  if (!u) return { doctorId: null, clinicId: null };

  let doc: { id: string; clinicId: string | null } | null = null;

  if (typeof u.doctorId === "string" && u.doctorId) {
    doc = await prisma.doctor.findUnique({
      where: { id: u.doctorId },
      select: { id: true, clinicId: true },
    });
  }

  if (!doc && typeof u.email === "string" && u.email) {
    try {
      doc = await prisma.doctor.findFirst({
        where: { email: u.email },
        select: { id: true, clinicId: true },
      });
    } catch {}
  }

  if (!doc && typeof u.id === "string") {
    doc = await prisma.doctor.findUnique({
      where: { id: u.id },
      select: { id: true, clinicId: true },
    });
  }

  let clinicId: string | null = doc?.clinicId ?? null;
  try {
    if (!clinicId && (prisma as any).clinicDoctor && typeof u.id === "string") {
      const cd = await (prisma as any).clinicDoctor.findFirst({
        where: { userId: u.id },
        select: { clinicId: true },
      });
      clinicId = cd?.clinicId ?? null;
    }
  } catch {}

  return { doctorId: doc?.id ?? null, clinicId };
}

/** Klinik ID resolveri (klinika / doctor kontekstinə görə) */
async function resolveClinicIdForPatient(opts: {
  session: any;
  patientId?: string | null;
  doctorId?: string | null;
}) {
  const { session, patientId, doctorId } = opts;

  try {
    if ((prisma as any).clinicPatient && patientId) {
      const cp = await (prisma as any).clinicPatient.findFirst({
        where: { patientGlobalId: patientId },
        select: { clinicId: true },
      });
      if (cp?.clinicId) return cp.clinicId as string;
    }
  } catch {}

  try {
    const u = session?.user as any;
    if (u?.role === "clinic" && typeof u?.id === "string") return u.id as string;
    if (typeof u?.clinicId === "string" && u.clinicId) return u.clinicId as string;
  } catch {}

  try {
    if (doctorId) {
      const doc = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { clinicId: true },
      });
      if (doc?.clinicId) return doc.clinicId;
    }
  } catch {}

  return null;
}

/** body.patientId həm Patient.id, həm ClinicPatient.id ola bilər */
async function resolvePatientContextByAnyKey(
  patientOrMembershipId: string,
  session: any
): Promise<{ patientId: string | null; patientUserId: string | null }> {
  let patientId: string | null = null;
  let patientUserId: string | null = null;

  // 1) Patient.id kimi yoxla
  try {
    const p = await prisma.patient.findUnique({
      where: { id: patientOrMembershipId },
      select: { id: true, email: true },
    });

    if (p) {
      patientId = p.id;
      if (p.email) {
        const u = await prisma.user.findUnique({
          where: { email: p.email },
          select: { id: true },
        });
        if (u) patientUserId = u.id;
      }
      if (!patientUserId) {
        const u2 = await prisma.user.findUnique({
          where: { id: p.id },
          select: { id: true },
        });
        if (u2) patientUserId = u2.id;
      }
      return {
        patientId,
        patientUserId: patientUserId ?? (session?.user as any)?.id ?? null,
      };
    }
  } catch {}

  // 2) ClinicPatient.id kimi yoxla
  try {
    const cp = await prisma.clinicPatient.findUnique({
      where: { id: patientOrMembershipId },
      select: {
        id: true,
        patientUserId: true,
        email: true,
        patientGlobalId: true,
      },
    });

    if (!cp) {
      return { patientId: null, patientUserId: null };
    }

    if (cp.patientUserId) {
      patientUserId = cp.patientUserId;
    } else if (cp.email) {
      const u = await prisma.user.findUnique({
        where: { email: cp.email },
        select: { id: true },
      });
      if (u) patientUserId = u.id;
    }

    if (cp.patientGlobalId) {
      const p2 = await prisma.patient.findUnique({
        where: { id: cp.patientGlobalId },
        select: { id: true, email: true },
      });
      if (p2) {
        patientId = p2.id;
        if (!patientUserId && p2.email) {
          const u = await prisma.user.findUnique({
            where: { email: p2.email },
            select: { id: true },
          });
          if (u) patientUserId = u.id;
        }
        if (!patientUserId) {
          const u2 = await prisma.user.findUnique({
            where: { id: p2.id },
            select: { id: true },
          });
          if (u2) patientUserId = u2.id;
        }
      }
    }

    return {
      patientId: patientId ?? null,
      patientUserId: patientUserId ?? (session?.user as any)?.id ?? null,
    };
  } catch {}

  return { patientId: null, patientUserId: (session?.user as any)?.id ?? null };
}

// ====================== GET ======================
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const clinicIdParam = url.searchParams.get("clinicId") || undefined;
  const doctorIdParam = url.searchParams.get("doctorId") || undefined;
  const patientIdParam = url.searchParams.get("patientId") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const from = parseDate(url.searchParams.get("from"));
  const to = parseDate(url.searchParams.get("to"));

  const role = (session.user as any)?.role;
  if (!["clinic", "doctor", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Patient filter: həm Patient.id, həm ClinicPatient.id, həm də patientUserId əsasında
  let patientFilter: any = {};
  if (patientIdParam) {
    const { patientId, patientUserId } = await resolvePatientContextByAnyKey(
      patientIdParam,
      session
    );

    if (patientId && patientUserId) {
      patientFilter = {
        OR: [{ patientId }, { patientUserId }],
      };
    } else if (patientId) {
      patientFilter = { patientId };
    } else if (patientUserId) {
      patientFilter = { patientUserId };
    } else {
      // heç nə tapılmadısa, nəticə boş olsun
      patientFilter = { id: "__no_match__" };
    }
  }

  const where: any = {
    ...(clinicIdParam ? { clinicId: clinicIdParam } : {}),
    ...(doctorIdParam ? { doctorId: doctorIdParam } : {}),
    ...patientFilter,
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { procedureCode: { contains: q, mode: "insensitive" } },
            { procedureName: { contains: q, mode: "insensitive" } },
            { notes: { contains: q, mode: "insensitive" } },
            {
              patient: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                ],
              },
            },
            {
              doctor: {
                OR: [
                  { fullName: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const rows = await prisma.treatmentEntry.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      clinic: { select: { id: true, name: true } },
      doctor: {
        select: { id: true, fullName: true, email: true, profilePhoto: true },
      },
      patient: { select: { id: true, name: true, email: true } },
      // 🔑 fallback üçün
      patientUser: { select: { id: true, name: true, email: true } },
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
        include: {
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
    },
  });

  // patient boşdursa və ya email boşdursa → patientUser və ClinicPatient-dən doldur
  const items = await Promise.all(
    rows.map(async (r) => {
      let patient: any = r.patient
        ? { ...r.patient }
        : r.patientUser
        ? {
            id: r.patientUser.id,
            name: r.patientUser.name ?? "",
            email: r.patientUser.email ?? null,
          }
        : null;

      // email hələ də boşdursa, ClinicPatient-dən tapmağa çalış
      if ((!patient || !patient.email) && r.clinicId && r.patientUserId) {
        try {
          const cp = await prisma.clinicPatient.findFirst({
            where: {
              clinicId: r.clinicId,
              patientUserId: r.patientUserId,
            },
            select: { email: true },
          });
          if (cp?.email) {
            if (!patient) {
              patient = {
                id: r.patientUserId,
                name: r.patientUser?.name ?? "",
                email: cp.email,
              };
            } else {
              patient.email = cp.email;
            }
          }
        } catch {}
      }

      return {
        ...r,
        patient,
      };
    })
  );

  return NextResponse.json({ items });
}

// ====================== POST ======================
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["clinic", "doctor", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (
    !body?.patientId ||
    !body?.date ||
    !body?.category ||
    !body?.procedureCode ||
    !body?.procedureName
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.teeth) || body.teeth.length === 0) {
    return NextResponse.json(
      { error: "At least one tooth is required" },
      { status: 400 }
    );
  }

  const date = new Date(body.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  // body.patientId həm Patient.id, həm ClinicPatient.id ola bilər
  const { patientId, patientUserId } = await resolvePatientContextByAnyKey(
    body.patientId as string,
    session
  );

  // DOCTOR konteksti
  let enforcedDoctorId: string | null = null;
  let enforcedClinicId: string | null = null;

  if (role === "doctor") {
    const ctx = await resolveDoctorContext(session);
    if (!ctx.doctorId || !ctx.clinicId) {
      return NextResponse.json(
        { error: "Doctor has no clinic context." },
        { status: 403 }
      );
    }
    enforcedDoctorId = ctx.doctorId;
    enforcedClinicId = ctx.clinicId;
  }

  const resolvedClinicId =
    enforcedClinicId ??
    (await resolveClinicIdForPatient({
      session,
      patientId: patientId ?? (body.patientId as string),
      doctorId:
        (body.doctorId as string) ??
        ((session.user as any)?.doctorId as string | null),
    }));

  const created = await prisma.treatmentEntry.create({
    data: {
      clinicId: body.clinicId ?? resolvedClinicId ?? null,
      doctorId:
        enforcedDoctorId ??
        body.doctorId ??
        ((session.user as any).doctorId ?? null),
      // 🔑 patientId yalnız real Patient.id tapılıbsa yazılır, yoxdursa NULL (artıq optional-dır)
      patientId: patientId ?? null,
      patientUserId: patientUserId ?? (session.user as any).id,
      date,
      status: body.status ?? "PLANNED",
      category: body.category,
      procedureCode: body.procedureCode,
      procedureName: body.procedureName,
      notes: body.notes ?? null,
      price:
        body.price === null || body.price === undefined
          ? null
          : Number(body.price),
      surfaces: Array.isArray(body.surfaces) ? body.surfaces : [],
      teeth: {
        create: body.teeth.map((t: any) => ({
          numberFDI: t.numberFDI,
          arch:
            t.arch ??
            (t.numberFDI >= 11 && t.numberFDI <= 28 ? "upper" : "lower"),
          quadrant:
            t.quadrant ??
            (t.numberFDI >= 11 && t.numberFDI <= 18
              ? 1
              : t.numberFDI >= 21 && t.numberFDI <= 28
              ? 2
              : t.numberFDI >= 31 && t.numberFDI <= 38
              ? 3
              : 4),
        })),
      },
      attachments: {
        create: Array.isArray(body.attachmentIds)
          ? body.attachmentIds.map((pid: string) => ({
              patientFileId: pid,
            }))
          : [],
      },
    },
    include: {
      clinic: { select: { id: true, name: true } },
      doctor: {
        select: { id: true, fullName: true, email: true, profilePhoto: true },
      },
      patient: { select: { id: true, name: true, email: true } },
      patientUser: { select: { id: true, name: true, email: true } },
      teeth: true,
      attachments: {
        include: {
          patientFile: {
            select: { id: true, title: true, path: true, thumbnail: true },
          },
        },
      },
    },
  });

  // Yeni yaradılan cavabda da eyni fallback
  let patient: any = created.patient
    ? { ...created.patient }
    : created.patientUser
    ? {
        id: created.patientUser.id,
        name: created.patientUser.name ?? "",
        email: created.patientUser.email ?? null,
      }
    : null;

  if ((!patient || !patient.email) && created.clinicId && created.patientUserId) {
    try {
      const cp = await prisma.clinicPatient.findFirst({
        where: {
          clinicId: created.clinicId,
          patientUserId: created.patientUserId,
        },
        select: { email: true },
      });
      if (cp?.email) {
        if (!patient) {
          patient = {
            id: created.patientUserId,
            name: created.patientUser?.name ?? "",
            email: cp.email,
          };
        } else {
          patient.email = cp.email;
        }
      }
    } catch {}
  }

  const item: any = {
    ...created,
    patient,
  };

  return NextResponse.json({ item }, { status: 201 });
}
