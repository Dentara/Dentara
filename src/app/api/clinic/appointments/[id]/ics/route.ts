import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toICSDate(dt: Date) {
  // UTC format: YYYYMMDDTHHMMSSZ
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mm = String(dt.getUTCMinutes()).padStart(2, "0");
  const ss = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function parseHHMM(time: string | null | undefined) {
  const [h, m] = (time || "00:00").split(":").map((x) => parseInt(x || "0", 10));
  return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
}

function addMinutes(date: Date, minutes: number) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        clinic: { select: { name: true } },
        doctor: { select: { fullName: true } },
        patient: { select: { name: true, email: true } },
      },
    });

    if (!appt) {
      return new Response("Not found", { status: 404 });
    }

    // Start datetime from appt.date + time
    const start = new Date(appt.date);
    const { h, m } = parseHHMM(appt.time);
    start.setUTCHours(h, m, 0, 0);

    // End datetime: use stored endTime or default +30 mins
    let end: Date;
    if (appt.endTime) {
      const e = new Date(appt.date);
      const { h: eh, m: em } = parseHHMM(appt.endTime);
      e.setUTCHours(eh, em, 0, 0);
      end = e;
    } else {
      end = addMinutes(start, 30);
    }

    const uid = `dentara-${appt.id}@dentara.io`;
    const now = new Date();

    const title = `Appointment${appt.doctor?.fullName ? ` with ${appt.doctor.fullName}` : ""}`;
    const location = appt.clinic?.name ? appt.clinic.name : "Dentara Clinic";
    const descLines = [
      appt.reason ? `Reason: ${appt.reason}` : "",
      appt.notes ? `Notes: ${appt.notes}` : "",
      appt.patient?.name ? `Patient: ${appt.patient.name}` : "",
    ]
      .filter(Boolean)
      .join("\\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Dentara//Appointments//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${toICSDate(now)}`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${title.replace(/\r?\n/g, " ")}`,
      `LOCATION:${location.replace(/\r?\n/g, " ")}`,
      `DESCRIPTION:${descLines}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=appointment-${appt.id}.ics`,
      },
    });
  } catch (e) {
    console.error("[ICS] error:", e);
    return new Response("Server error", { status: 500 });
  }
}
