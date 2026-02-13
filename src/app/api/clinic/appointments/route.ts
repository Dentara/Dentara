import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

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
const lc = (s?: string | null) => (s ? s.toLowerCase() : undefined);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

function getOrigin(req: Request) {
  try {
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
}

/**
 * patientOrMembershipId həm Patient.id, həm də ClinicPatient.id ola bilər.
 * Appointment üçün:
 *  - patientId  → Patient.id (global EMR) və ya NULL
 *  - clinicPatientId → ClinicPatient.id (join pasiyent üçün)
 */
async function resolveAppointmentPatient(
  patientOrMembershipId: string
): Promise<{ patientId: string | null; clinicPatientId: string | null }> {
  // 1) Birbaşa Patient.id kimi yoxla
  const p = await prisma.patient.findUnique({
    where: { id: patientOrMembershipId },
    select: { id: true },
  });
  if (p) {
    return { patientId: p.id, clinicPatientId: null };
  }

  // 2) ClinicPatient.id kimi yoxla
  const cp = await prisma.clinicPatient.findUnique({
    where: { id: patientOrMembershipId },
    select: { id: true, patientGlobalId: true },
  });
  if (!cp) {
    return { patientId: null, clinicPatientId: null };
  }

  return {
    patientId: cp.patientGlobalId ?? null,
    clinicPatientId: cp.id,
  };
}

/* ========================= GET (LIST) ========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;
    const patientId = searchParams.get("patientId") || undefined;
    const patientEmail = searchParams.get("patientEmail") || undefined;
    const statusCsv = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;

    const from = parseDateInput(searchParams.get("from"));
    const to = parseDateInput(searchParams.get("to"));

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    if (statusCsv) {
      const list = statusCsv
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (list.length) where.status = { in: list };
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    if (q) {
      where.OR = [
        { reason: { contains: q, mode: "insensitive" } },
        { type: { contains: q, mode: "insensitive" } },
        { patient: { name: { contains: q, mode: "insensitive" } } },
        { doctor: { fullName: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (patientEmail) {
      where.AND = (where.AND || []).concat({
        OR: [
          { patient: { email: patientEmail } },
          { clinicPatient: { email: patientEmail } },
        ],
      });
    }

    const items = await prisma.appointment.findMany({
      where,
      include: {
        clinic: { select: { id: true, name: true } },
        patient: {
          select: { id: true, name: true, image: true, email: true },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("[GET /api/clinic/appointments] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ========================= POST (CREATE) ========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.doctorId || !body?.patientId) {
      return NextResponse.json(
        { error: "doctorId and patientId are required" },
        { status: 400 }
      );
    }

    // patientId həm Patient.id, həm də ClinicPatient.id ola bilər
    const {
      patientId,
      clinicPatientId,
    } = await resolveAppointmentPatient(String(body.patientId));

    if (!patientId && !clinicPatientId) {
      return NextResponse.json(
        { error: "Invalid patientId (no Patient / ClinicPatient found)" },
        { status: 400 }
      );
    }

    let clinicId: string | undefined = body?.clinicId;

    // 1) doctor üzərindən clinicId
    if (!clinicId && body?.doctorId) {
      const doc = await prisma.doctor.findUnique({
        where: { id: String(body.doctorId) },
        select: { clinicId: true },
      });
      clinicId = doc?.clinicId || clinicId;
    }

    // 2) patient (global) üzərindən clinicId
    if (!clinicId && patientId) {
      const pat = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { clinicId: true },
      });
      clinicId = pat?.clinicId || clinicId;
    }

    // 3) ClinicPatient üzərindən clinicId
    if (!clinicId && clinicPatientId) {
      const cp = await prisma.clinicPatient.findUnique({
        where: { id: clinicPatientId },
        select: { clinicId: true },
      });
      clinicId = cp?.clinicId || clinicId;
    }

    if (!clinicId) {
      return NextResponse.json(
        { error: "clinicId could not be resolved from doctor/patient" },
        { status: 400 }
      );
    }

    if (
      !body?.reason ||
      typeof body.reason !== "string" ||
      !body.reason.trim()
    ) {
      return NextResponse.json(
        { error: "reason is required" },
        { status: 400 }
      );
    }

    const date = parseDateInput(body?.date);
    if (!date) {
      return NextResponse.json(
        { error: "Invalid or missing date" },
        { status: 400 }
      );
    }
    if (!body?.time || typeof body.time !== "string") {
      return NextResponse.json(
        { error: "time (HH:mm) is required" },
        { status: 400 }
      );
    }

    const data: any = {
      clinicId,
      doctorId: body.doctorId,
      patientId: patientId ?? null, // ← FK optional
      clinicPatientId: clinicPatientId ?? null,
      date,
      time: body.time ?? "",
      endTime: typeof body.endTime === "string" ? body.endTime : "",
      status: lc(body.status) || "scheduled",
      type: typeof body.type === "string" ? body.type : "",
      reason: typeof body.reason === "string" ? body.reason : "",
      notes: typeof body.notes === "string" ? body.notes : "",
    };

    const created = await prisma.appointment.create({
      data,
      include: {
        clinic: { select: { id: true, name: true } },
        patient: {
          select: { id: true, name: true, image: true, email: true },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
            email: true,
          },
        },
      },
    });

    // ---- Email with Add-to-Calendar links ----
    try {
      const origin = getOrigin(req);
      const dateStr = fmt(created.date);
      const clinicName = created.clinic?.name || "Clinic";
      const doctorName = created.doctor?.fullName || "Doctor";

      const icsUrl = `${origin}/api/clinic/appointments/${created.id}/ics`;

      const start = new Date(created.date);
      const [hh, mm] = (created.time || "00:00")
        .split(":")
        .map((v) => parseInt(v || "0", 10));
      start.setUTCHours(hh || 0, mm || 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      const toG = (d: Date) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
          d.getUTCDate()
        )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
      const gStart = toG(start);
      const gEnd = toG(end);
      const gTitle = encodeURIComponent(`Appointment with ${doctorName}`);
      const gDetails = encodeURIComponent(`Clinic: ${clinicName}`);
      const gLocation = encodeURIComponent(clinicName);
      const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${gTitle}&dates=${gStart}/${gEnd}&details=${gDetails}&location=${gLocation}&sf=true&output=xml`;

      const patientEmail = created.patient?.email;
      const doctorEmail = created.doctor?.email;

      const addToCalHtml = `
        <p style="margin:12px 0 6px 0;"><b>Add to calendar:</b></p>
        <p style="margin:0;">
          <a href="${icsUrl}" target="_blank">Download ICS</a>
          &nbsp;|&nbsp;
          <a href="${googleUrl}" target="_blank">Google Calendar</a>
        </p>
      `;

      const patientHtml = `
        <p>Your appointment was created at <b>${clinicName}</b> with <b>${doctorName}</b>.</p>
        <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${created.time || ""}</p>
        ${addToCalHtml}
      `;
      const doctorHtml = `
        <p>A new appointment was scheduled for you at <b>${clinicName}</b>.</p>
        <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${created.time || ""}</p>
        ${addToCalHtml}
      `;

      if (patientEmail)
        await sendEmail({
          to: patientEmail,
          subject: "Tagiza — Appointment Created",
          html: patientHtml,
        });
      if (doctorEmail)
        await sendEmail({
          to: doctorEmail,
          subject: "Tagiza — New Appointment Assigned",
          html: doctorHtml,
        });
    } catch (e) {
      console.error("[appointments POST] email send failed:", e);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[POST /api/clinic/appointments] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
