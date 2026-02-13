import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

const MINUTE = 60 * 1000;

function toStartDateTime(appt: any): Date {
  // appt.date UTC + appt.time (HH:mm) ⇒ UTC Date
  const d = new Date(appt.date);
  const [hh, mm] = (appt.time || "00:00").split(":").map((v: string) => parseInt(v || "0", 10));
  d.setUTCHours(hh || 0, mm || 0, 0, 0);
  return d;
}

function withinWindow(now: Date, start: Date, lowMs: number, highMs: number) {
  const delta = start.getTime() - now.getTime();
  return delta >= lowMs && delta < highMs;
}

function buildHtml(kind: "24h" | "2h", appt: any) {
  const dateStr = new Date(appt.date).toISOString().slice(0, 10);
  const clinicName = appt.clinic?.name || "Clinic";
  const doctorName = appt.doctor?.fullName || "Doctor";
  const when = kind === "24h" ? "in 24 hours" : "in 2 hours";
  return `
    <p>Reminder: You have an appointment ${when}.</p>
    <p><b>Clinic:</b> ${clinicName} &nbsp; <b>Doctor:</b> ${doctorName}</p>
    <p><b>Date:</b> ${dateStr} &nbsp; <b>Time:</b> ${appt.time || ""}</p>
  `;
}

export async function GET(req: Request) {
  try {
    // Simple auth: secret query or header
    const url = new URL(req.url);
    const qsSecret = url.searchParams.get("secret");
    const hdrSecret = (req.headers.get("x-cron-secret") || "").trim();
    const secret = process.env.CRON_SECRET || "";
    if (secret) {
      if (qsSecret !== secret && hdrSecret !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();

    // Yalnız gələcək/scheduled görüşlər
    const appts = await prisma.appointment.findMany({
      where: {
        status: "scheduled",
      },
      include: {
        clinic:  { select: { name: true } },
        doctor:  { select: { fullName: true, email: true } },
        patient: { select: { email: true } },
      },
    });

    let sent24 = 0;
    let sent2 = 0;

    for (const a of appts) {
      const start = toStartDateTime(a);

      // 24 saat pəncərəsi: [23h, 25h) — cron vaxt sürüşmələrinə tolerant olmaq üçün
      if (!a.reminder24hSent && withinWindow(now, start, 23 * MINUTE * 60, 25 * MINUTE * 60)) {
        const html = buildHtml("24h", a);
        try {
          if (a.patient?.email) await sendEmail({ to: a.patient.email, subject: "Dentara — Appointment Reminder (24h)", html });
          if (a.doctor?.email)  await sendEmail({ to: a.doctor.email,  subject: "Dentara — Appointment Reminder (24h)", html });
          await prisma.appointment.update({
            where: { id: a.id },
            data: { reminder24hSent: true },
          });
          sent24++;
        } catch (e) {
          console.error("[reminder 24h] email failed for", a.id, e);
        }
      }

      // 2 saat pəncərəsi: [110min, 130min)
      if (!a.reminder2hSent && withinWindow(now, start, 110 * MINUTE, 130 * MINUTE)) {
        const html = buildHtml("2h", a);
        try {
          if (a.patient?.email) await sendEmail({ to: a.patient.email, subject: "Dentara — Appointment Reminder (2h)", html });
          if (a.doctor?.email)  await sendEmail({ to: a.doctor.email,  subject: "Dentara — Appointment Reminder (2h)", html });
          await prisma.appointment.update({
            where: { id: a.id },
            data: { reminder2hSent: true },
          });
          sent2++;
        } catch (e) {
          console.error("[reminder 2h] email failed for", a.id, e);
        }
      }
    }

    return NextResponse.json({ ok: true, sent24, sent2, checked: appts.length, now: now.toISOString() });
  } catch (err) {
    console.error("[cron reminders] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
