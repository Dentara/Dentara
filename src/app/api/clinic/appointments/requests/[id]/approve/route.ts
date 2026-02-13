import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAppointmentCreatedEmails } from "@/app/libs/email";

export const dynamic = "force-dynamic";

/* ----------------------------- Helpers ----------------------------- */
// "YYYY-MM-DD" və ya ISO -> UTC midnight
function parseDateInput(input?: string | null): Date | undefined {
  if (!input) return undefined;
  if (typeof input !== "string") return undefined;
  if (input.includes("T")) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const [y, m, d] = input.split("-").map((x) => parseInt(x || "0", 10));
  if (!y || !m || !d) return undefined;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

// HH:mm üzərinə dəqiqə əlavə et
function addMinutes(hhmm: string, minutes: number) {
  const [H, M] = (hhmm || "00:00").split(":").map((n) => parseInt(n || "0", 10));
  const total = (H * 60 + M) + (minutes || 0);
  const hh = String(Math.floor((total % (24 * 60)) / 60)).padStart(2, "0");
  const mm = String(total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
/* ------------------------------------------------------------------ */

/**
 * PATCH /api/clinic/appointments/requests/:id/approve
 * Body (optional overrides):
 *  { clinicId?, doctorId?, patientId?, date?, time?, endTime?, durationMin? }
 *
 * Qeyd:
 *  - Appointment modelində doctorId məcburidir (request-də yoxdursa body-dən gəlməlidir).
 *  - durationMin göndərilərsə və endTime verilməyibsə → endTime = time + durationMin
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));

    const request = await prisma.appointmentRequest.findUnique({
      where: { id },
      include: {
        clinic:  { select: { id: true, name: true } },
        doctor:  { select: { id: true, fullName: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (request.status !== "pending" && request.status !== "proposed") {
      return NextResponse.json({ error: `Request already ${request.status}` }, { status: 400 });
    }

    const clinicId  = body?.clinicId  || request.clinicId;
    const patientId = body?.patientId || request.patientId;

    const date = parseDateInput(body?.date) || request.date;
    const time: string =
      typeof body?.time === "string" ? body.time : request.time;

    // End time prioritetləri: body.endTime -> (durationMin varsa time+duration) -> request.endTime -> ""
    let endTime: string =
      typeof body?.endTime === "string" && body.endTime
        ? body.endTime
        : (typeof body?.durationMin === "number" && body.durationMin > 0)
        ? addMinutes(time, body.durationMin)
        : (request.endTime || "");

    let doctorId: string | undefined = body?.doctorId || request.doctorId;
    if (!doctorId) {
      // request həkimi sistemdə yox idisə (targetDoctorEmail), təsdiqləyərkən doctorId verilməlidir
      return NextResponse.json({ error: "doctorId is required to approve" }, { status: 400 });
    }
    if (!clinicId) {
      return NextResponse.json({ error: "clinicId is required to approve" }, { status: 400 });
    }

    // Create real appointment
    const created = await prisma.appointment.create({
      data: {
        clinicId,
        doctorId,
        patientId,
        date,
        time,
        endTime,
        status: "scheduled",
        type: request.targetType === "doctor" ? "doctor" : "clinic",
        reason: request.reason || "",
        // Pasiyentin request-də yazdığı note-u olduğu kimi köçürürük
        notes: request.notes || "",
      },
      include: {
        clinic:  { select: { id: true, name: true } },
        doctor:  { select: { id: true, fullName: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });

    // Mark request approved
    await prisma.appointmentRequest.update({
      where: { id },
      data: { status: "approved" },
    });

    // Emails (soft-fail)
    try {
      await sendAppointmentCreatedEmails({
        patientEmail: created.patient?.email,
        doctorEmail:  created.doctor?.email,
        clinicEmail:  null,
        clinicName:   created.clinic?.name,
        doctorName:   created.doctor?.fullName,
        date:         created.date,
        time:         created.time,
      });
    } catch (e) {
      console.error("[approve] email error:", e);
    }

    return NextResponse.json({ ok: true, appointment: created });
  } catch (err) {
    console.error("[PATCH /requests/:id/approve] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
