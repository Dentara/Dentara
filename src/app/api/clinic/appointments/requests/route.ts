import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// "YYYY-MM-DD" və ya ISO -> UTC midnight
function parseDateInput(input?: string | null): Date | undefined {
  if (!input) return undefined;
  if (input.includes("T")) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const [y, m, d] = input.split("-").map((x) => parseInt(x || "0", 10));
  if (!y || !m || !d) return undefined;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/** Mövcud Patient.id tapır:
 *  1) body.patientId Patient.id-disə → götürürük
 *  2) body.patientUserId → ClinicPatient.patientId-dən tapırıq
 *  3) body.patientEmail → Patient.email-dən tapırıq
 */
async function resolvePatientId(body: any): Promise<string | undefined> {
  // 1) patientId Patient.id ola bilər
  if (typeof body?.patientId === "string" && body.patientId) {
    const p = await prisma.patient.findUnique({ where: { id: body.patientId }, select: { id: true } });
    if (p?.id) return p.id;
  }

  // 2) patientUserId → ClinicPatient.patientId
  if (typeof body?.patientUserId === "string" && body.patientUserId) {
    const cp = await prisma.clinicPatient.findFirst({
      where: { patientUserId: body.patientUserId },
      select: { patientId: true },
    });
    if (cp?.patientId) return cp.patientId;
  }

  // 3) patientEmail → Patient.id
  if (typeof body?.patientEmail === "string" && body.patientEmail) {
    const p = await prisma.patient.findFirst({
      where: { email: body.patientEmail },
      select: { id: true },
    });
    if (p?.id) return p.id;
  }

  return undefined;
}

/**
 * GET /api/clinic/appointments/requests
 * Query: clinicId?, doctorId?, patientId?, status?, from?, to?
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;

    // NEW — patient filters
    const patientIdRaw = searchParams.get("patientId") || undefined;          // Patient.id ola bilər
    const patientUserId = searchParams.get("patientUserId") || undefined;     // session user id (ClinicPatient.patientUserId)
    const patientEmail = searchParams.get("patientEmail") || undefined;       // Patient.email

    const statusCsv = searchParams.get("status") || undefined;
    const from = parseDateInput(searchParams.get("from"));
    const to = parseDateInput(searchParams.get("to"));

    // Resolve Patient.id if needed
    let resolvedPatientId: string | undefined = patientIdRaw;
    if (!resolvedPatientId && patientUserId) {
      const cp = await prisma.clinicPatient.findFirst({
        where: { patientUserId },
        select: { patientId: true },
      });
      if (cp?.patientId) resolvedPatientId = cp.patientId;
    }
    if (!resolvedPatientId && patientEmail) {
      const p = await prisma.patient.findFirst({
        where: { email: patientEmail },
        select: { id: true },
      });
      if (p?.id) resolvedPatientId = p.id;
    }

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (doctorId) where.doctorId = doctorId;
    if (resolvedPatientId) where.patientId = resolvedPatientId;

    if (statusCsv) {
      const list = statusCsv.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (list.length) where.status = { in: list };
    }
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }
    const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10) || 200, 500);
    const items = await prisma.appointmentRequest.findMany({
      where,
      include: {
        clinic:  { select: { id: true, name: true } },
        doctor:  { select: { id: true, fullName: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("[GET /api/clinic/appointments/requests] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/clinic/appointments/requests
 * Body:
 *  {
 *    targetType: "clinic"|"doctor",
 *    clinicId?, doctorId?, targetDoctorEmail?, targetDoctorName?,
 *    patientId? (Patient.id və ya userId ola bilər), patientUserId?, patientEmail?,
 *    date, time, endTime?, reason*, notes?
 *  }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Reason required
    if (!body?.reason || typeof body.reason !== "string" || !body.reason.trim()) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }

    const targetType = body?.targetType;
    if (targetType !== "clinic" && targetType !== "doctor") {
      return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
    }

    const date = parseDateInput(body?.date);
    if (!date) return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });

    if (!body?.time || typeof body.time !== "string") {
      return NextResponse.json({ error: "time (HH:mm) is required" }, { status: 400 });
    }

    // Resolve clinic/doctor targets
    let clinicId: string | undefined;
    let doctorId: string | undefined;
    let targetDoctorEmail: string | undefined;
    let targetDoctorName: string | undefined;

    if (targetType === "clinic") {
      clinicId = typeof body?.clinicId === "string" && body.clinicId.length ? body.clinicId : undefined;
      if (!clinicId) return NextResponse.json({ error: "clinicId is required for targetType=clinic" }, { status: 400 });
    } else {
      doctorId = typeof body?.doctorId === "string" && body.doctorId.length ? body.doctorId : undefined;
      if (!doctorId) {
        targetDoctorEmail =
          typeof body?.targetDoctorEmail === "string" && body.targetDoctorEmail.length
            ? body.targetDoctorEmail
            : undefined;
        targetDoctorName =
          typeof body?.targetDoctorName === "string" && body.targetDoctorName.length
            ? body.targetDoctorName
            : undefined;
        if (!targetDoctorEmail) {
          return NextResponse.json(
            { error: "doctorId or targetDoctorEmail is required for targetType=doctor" },
            { status: 400 },
          );
        }
      }
      clinicId = typeof body?.clinicId === "string" && body.clinicId.length ? body.clinicId : undefined;
    }

    // Resolve Patient.id for FK
    const resolvedPatientId = await resolvePatientId({
      patientId: body?.patientId,
      patientUserId: body?.patientUserId,
      patientEmail: body?.patientEmail,
    });
    if (!resolvedPatientId) {
      return NextResponse.json({ error: "patient_not_found" }, { status: 400 });
    }

    // DEDUPE: Existing pending request for same time
    const duplicateReq = await prisma.appointmentRequest.findFirst({
      where: {
        patientId: resolvedPatientId,
        date,
        time: body.time,
        status: "pending",
        ...(clinicId ? { clinicId } : {}),
        OR: doctorId ? [{ doctorId }] : [{ targetDoctorEmail: targetDoctorEmail! }],
      },
      select: { id: true },
    });
    if (duplicateReq) {
      return NextResponse.json(
        { error: "duplicate_request", message: "You already have a pending request for this time.", duplicateId: duplicateReq.id },
        { status: 409 },
      );
    }

    // DEDUPE: Existing appointment
    if (doctorId) {
      const duplicateAppt = await prisma.appointment.findFirst({
        where: {
          patientId: resolvedPatientId,
          doctorId,
          date,
          time: body.time,
          status: { in: ["scheduled", "in_progress"] },
        },
        select: { id: true },
      });
      if (duplicateAppt) {
        return NextResponse.json(
          { error: "duplicate_appointment", message: "An appointment already exists for this time.", appointmentId: duplicateAppt.id },
          { status: 409 },
        );
      }
    }

    // Create request
    const created = await prisma.appointmentRequest.create({
      data: {
        targetType,
        clinicId,
        doctorId,
        targetDoctorEmail,
        targetDoctorName,
        patientId: resolvedPatientId,
        date,
        time: body.time,
        endTime: typeof body?.endTime === "string" ? body.endTime : undefined,
        reason: body.reason.trim(),
        notes: typeof body?.notes === "string" ? body.notes : undefined,
        status: "pending",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[POST /api/clinic/appointments/requests] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
