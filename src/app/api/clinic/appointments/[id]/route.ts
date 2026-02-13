import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

function parseDateInput(input: unknown): Date | undefined {
  if (!input || typeof input !== "string") return undefined;
  if (input.includes("T")) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const parts = input.split("-");
  if (parts.length < 3) return undefined;
  const y = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "1", 10) - 1;
  const d = parseInt(parts[2] || "1", 10);
  if (!y || m < 0 || d < 1) return undefined;
  return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
}
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const ALLOWED_STATUS = new Set(["scheduled","in_progress","completed","cancelled"]);

function getOrigin(req: Request) {
  try {
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
}

function buildUpdateData(body: any) {
  const data: any = {};

  if (typeof body?.date === "string") {
    const dt = parseDateInput(body.date);
    if (dt) data.date = dt;
  }

  const stringFields = [
    "time", "endTime", "type", "department", "room",
    "notes", "reason", "reasonForVisit", "procedureType", "toothNumber",
  ];
  for (const key of stringFields) {
    if (typeof body?.[key] === "string") data[key] = body[key];
  }

  if (typeof body?.status === "string") {
    const st = body.status.toLowerCase();
    if (!ALLOWED_STATUS.has(st)) {
      throw new Error(`Invalid status "${body.status}"`);
    }
    data.status = st;
  }

  if (typeof body?.duration !== "undefined") data.duration = body.duration;
  if (typeof body?.price !== "undefined") data.price = body.price;

  if (typeof body?.doctorId === "string" && body.doctorId.length > 0) data.doctorId = body.doctorId;
  if (typeof body?.patientId === "string" && body.patientId.length > 0) data.patientId = body.patientId;
  if (typeof body?.clinicId === "string" && body.clinicId.length > 0) data.clinicId = body.clinicId;

  return data;
}

/* ------------------------------ GET ------------------------------- */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        clinic: true,
      },
    });

    if (!appt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json(appt);
  } catch (err) {
    console.error("[GET /appointments/:id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ----------------------------- PATCH ------------------------------ */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();
    let data: any;
    try {
      data = buildUpdateData(body);
    } catch (e) {
    const silent = Boolean(body?.silent); // <-- context-menu əməliyyatları üçün email susdur    
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const before = await prisma.appointment.findUnique({
      where: { id },
      select: { status: true },
    });

    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: { patient: true, doctor: true, clinic: true },
    });

    // Status changed → email with "Add to Calendar" links
    try {
      if (!silent && before?.status !== updated.status) {
        const origin = getOrigin(req);
        const dateStr = fmt(updated.date);
        const clinicName = updated.clinic?.name || "Clinic";
        const doctorName = updated.doctor?.fullName || "Doctor";

        const icsUrl = `${origin}/api/clinic/appointments/${updated.id}/ics`;

        const start = new Date(updated.date);
        const [hh, mm] = (updated.time || "00:00").split(":").map((v) => parseInt(v || "0", 10));
        start.setUTCHours(hh || 0, mm || 0, 0, 0);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        const pad = (n: number) => String(n).padStart(2, "0");
        const toG = (d: Date) =>
          `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
            d.getUTCHours(),
          )}${pad(d.getUTCMinutes())}00Z`;
        const gStart = toG(start);
        const gEnd = toG(end);
        const gTitle = encodeURIComponent(`Appointment with ${doctorName}`);
        const gDetails = encodeURIComponent(`Clinic: ${clinicName}`);
        const gLocation = encodeURIComponent(clinicName);
        const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${gTitle}&dates=${gStart}/${gEnd}&details=${gDetails}&location=${gLocation}&sf=true&output=xml`;

        const addToCalHtml = `
          <p style="margin:12px 0 6px 0;"><b>Add to calendar:</b></p>
          <p style="margin:0;">
            <a href="${icsUrl}" target="_blank">Download ICS</a>
            &nbsp;|&nbsp;
            <a href="${googleUrl}" target="_blank">Google Calendar</a>
          </p>
        `;

        const patientEmail = updated.patient?.email;
        const doctorEmail  = updated.doctor?.email;
        const clinicEmail  = updated.clinic?.email; // ola da bilər, yox da; undefined olsa göndərməyəcəyik

        const patientHtml = `
          <p>Your appointment at <b>${clinicName}</b> with <b>${doctorName}</b> status changed to <b>${(updated.status || "").replace(/_/g," ")}</b>.</p>
          <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${updated.time || ""}</p>
          ${addToCalHtml}
        `;
        const doctorHtml = `
          <p>An appointment in <b>${clinicName}</b> assigned to you is now <b>${(updated.status || "").replace(/_/g," ")}</b>.</p>
          <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${updated.time || ""}</p>
          ${addToCalHtml}
        `;

        if (patientEmail) await sendEmail({ to: patientEmail, subject: "Tagiza — Appointment Status Updated", html: patientHtml });
        if (doctorEmail)  await sendEmail({ to: doctorEmail,  subject: "Tagiza — Appointment Status Updated", html: doctorHtml });
        if (clinicEmail)  await sendEmail({ to: clinicEmail,  subject: "Tagiza — Appointment Status Updated (Copy)", html: doctorHtml });
      }
    } catch (e) {
      console.error("[appointments PATCH] email send failed:", e);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /appointments/:id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ---------------------------- DELETE ------------------------------ */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /appointments/:id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
