import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

function getOrigin(req: Request) {
  try {
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
}
const fmt = (d: Date) => d.toISOString().slice(0, 10);

type RescheduleBody = {
  date?: string;      // "YYYY-MM-DD"
  time?: string;      // "HH:MM" və ya "HH:MM AM/PM"
  endTime?: string;
  duration?: number;  // dəqiqə
  status?: string;    // istəsən "Rescheduled", "Confirmed" və s.
  notify?: boolean;   // drag ilə dəyişəndə pasiyentə e-mail göndər
};

function toDateUTC(ymd?: string) {
  if (!ymd || typeof ymd !== "string") return undefined;
  const d = new Date(`${ymd}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? undefined : d;
}

function normalizeTime(t?: string) {
  if (!t || typeof t !== "string") return undefined;
  // HH:mm
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  // "h:mm AM/PM" və s. -> HH:mm
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return t; // uyğun gəlmirsə olduğu kimi saxla
  let hh = parseInt(m[1], 10);
  const mm = m[2];
  const ap = m[3].toUpperCase();
  if (ap === "PM" && hh < 12) hh += 12;
  if (ap === "AM" && hh === 12) hh = 0;
  return `${String(hh).padStart(2,"0")}:${mm}`;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user: any = session?.user;
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
    if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

    const { id } = await params;
    const body = (await req.json()) as RescheduleBody;

    // ID klinikaya məxsusdurmu?
    const appt = await prisma.appointment.findUnique({
      where: { id },
      select: { clinicId: true },
    });
    if (!appt || appt.clinicId !== clinicId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // İcazə verilən sahələr
    const data: any = {};
    if (typeof body.date !== "undefined") {
      const d = toDateUTC(body.date);
      if (!d) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      data.date = d;
    }
    if (typeof body.time !== "undefined") {
      const t = normalizeTime(body.time);
      if (!t) return NextResponse.json({ error: "Invalid time" }, { status: 400 });
      data.time = t;
    }
    if (typeof body.endTime !== "undefined") {
      const et = normalizeTime(body.endTime);
      if (!et) return NextResponse.json({ error: "Invalid endTime" }, { status: 400 });
      data.endTime = et;
    }
    // NOTE: Appointment sxemində `duration` kolonu yoxdur, gəlirsə də YOX SAYIRIQ
    if (typeof body.status !== "undefined") data.status = body.status;
    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, name: true, email: true, image: true } },
        doctor:  { select: { id: true, fullName: true, email: true } },
        clinic:  { select: { id: true, name: true, email: true } },
      },
    });

    // ---- E-mail bildirişi (drag təsdiqindən sonra) ----
    if (body.notify) {
      try {
        const origin = getOrigin(req as any);
        const dateStr = fmt(updated.date as any);
        const clinicName = updated.clinic?.name || "Clinic";
        const doctorName = updated.doctor?.fullName || "Doctor";

        // ICS linki və Google Calendar linki — create-dəki üslubla
        const icsUrl = `${origin}/api/clinic/appointments/${updated.id}/ics`;

        const start = new Date(updated.date as any);
        const [hh, mm] = (updated.time || "00:00").split(":").map((v) => parseInt(v || "0", 10));
        start.setUTCHours(hh || 0, mm || 0, 0, 0);
        const end = updated.endTime
          ? (() => {
              const e = new Date(updated.date as any);
              const [eh, em] = (updated.endTime || "00:00").split(":").map((v) => parseInt(v || "0", 10));
              e.setUTCHours(eh || 0, em || 0, 0, 0);
              return e;
            })()
          : new Date(start.getTime() + 30 * 60 * 1000);

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
        const clinicEmail  = updated.clinic?.email;

        const patientHtml = `
          <p>Your appointment at <b>${clinicName}</b> with <b>${doctorName}</b> has been <b>rescheduled</b>.</p>
          <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${updated.time || ""}${updated.endTime ? " – " + updated.endTime : ""}</p>
          ${addToCalHtml}
        `;
        const doctorHtml = `
          <p>An appointment in <b>${clinicName}</b> assigned to you has been <b>rescheduled</b>.</p>
          <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${updated.time || ""}${updated.endTime ? " – " + updated.endTime : ""}</p>
          ${addToCalHtml}
        `;

        // Eyni stil: create-dəki kimi sendEmail istifadə olunur
        if (patientEmail) await sendEmail({ to: patientEmail, subject: "Tagiza — Appointment Rescheduled", html: patientHtml });
        if (doctorEmail)  await sendEmail({ to: doctorEmail,  subject: "Tagiza — Appointment Rescheduled", html: doctorHtml });
        if (clinicEmail)  await sendEmail({ to: clinicEmail,  subject: "Tagiza — Appointment Rescheduled (Copy)", html: doctorHtml });
      } catch (e) {
        console.error("[reschedule notify] email send failed:", e);
        // Mail uğursuz olsa da API cavabı 200 qalır
      }
    }

    return NextResponse.json(updated);

  } catch (e) {
    console.error("PUT /api/clinic/appointments/[id]/reschedule error:", e);
    return NextResponse.json({ error: "Failed to reschedule" }, { status: 500 });
  }
}
