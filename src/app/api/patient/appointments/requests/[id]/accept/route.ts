import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAppointmentCreatedEmails, sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

/** Accept:
 * Normalda Request.status === "proposed" olmalıdır.
 * Uyğunluq rejimi: status pending olsa da proposed* varsa, qəbul et.
 * Missing doctorId üçün avtomatik həll:
 *  - targetDoctorEmail varsa — həmin həkimi tap
 *  - yoxdursa, clinicId üçün ilk əlçatan həkimi tap
 */
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const r = await prisma.appointmentRequest.findUnique({
      where: { id },
      include: {
        clinic:  { select: { id: true, name: true } },
        doctor:  { select: { id: true, fullName: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });

    if (!r) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // status tolerantlığı
    const hasProposal = !!r.proposedTime || !!r.proposedDate || !!r.proposedEndTime;
    if (r.status !== "proposed" && !hasProposal) {
      return NextResponse.json({ error: "No pending proposal" }, { status: 400 });
    }

    // ---- clinicId həlli
    let clinicId = r.clinicId || r.clinic?.id || undefined;
    if (!clinicId) {
      return NextResponse.json({ error: "clinicId missing (assign clinic first)" }, { status: 400 });
    }

    // ---- doctorId həlli
    let doctorId = r.doctorId || r.doctor?.id || undefined;

    if (!doctorId) {
      // 1) targetDoctorEmail ilə tapmağa cəhd et
      if (r.targetDoctorEmail) {
        const byEmail = await prisma.doctor.findFirst({
          where: {
            email: r.targetDoctorEmail,
            ...(clinicId ? { clinicId } : {}),
          },
          select: { id: true, fullName: true, email: true },
        });
        if (byEmail?.id) {
          doctorId = byEmail.id;
        }
      }

      // 2) clinicId var — klinikanın ilk aktiv həkimi (fallback)
      if (!doctorId && clinicId) {
        const anyDoc = await prisma.doctor.findFirst({
          where: { clinicId, status: "Active" },
          orderBy: { createdAt: "asc" },
          select: { id: true, fullName: true, email: true },
        });
        if (anyDoc?.id) {
          doctorId = anyDoc.id;
        }
      }

      // 3) yenə alınmadısa — aydın mesaj
      if (!doctorId) {
        return NextResponse.json(
          { error: "No doctor found for this request. Clinic must assign a doctor before patient can accept." },
          { status: 400 }
        );
      }
    }

    // ---- tarix/vaxt seçimi
    const date = r.proposedDate || r.date;
    const time = r.proposedTime || r.time;
    const endTime = r.proposedEndTime || r.endTime || "";

    const created = await prisma.appointment.create({
      data: {
        clinicId,
        doctorId,
        patientId: r.patientId,
        date,
        time,
        endTime,
        status: "scheduled",
        type: r.targetType === "doctor" ? "doctor" : "clinic",
        reason: r.reason || "",
        notes: r.notes || "",
      },
      include: {
        clinic:  { select: { id: true, name: true } },
        doctor:  { select: { fullName: true, email: true } },
        patient: { select: { name: true, email: true } },
      },
    });

    // Request-i approve et və proposed sahələri təmizlə
    await prisma.appointmentRequest.update({
      where: { id },
      data: {
        status: "approved",
        proposedDate: null,
        proposedTime: null,
        proposedEndTime: null,
        // təhlükəsizlik üçün, əgər doctorId/clinicId auto-resolve olundusa, request-ə də yazaq
        clinicId,
        doctorId,
      },
    });

    // email-lər (soft)
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

      const notify = (process.env.MAIL_NOTIFY || "patient").toLowerCase();
      const htmlInfo = `
        <p>Patient <b>${created.patient?.name || ""}</b> accepted the proposed time.</p>
        <p><b>Date:</b> ${created.date.toISOString().slice(0, 10)} &nbsp; <b>Time:</b> ${created.time}${
        created.endTime ? " – " + created.endTime : ""
      }</p>`;
      if (notify === "doctor" || notify === "both") {
        if (created.doctor?.email) {
          await sendEmail({ to: created.doctor.email, subject: "Dentara — Patient accepted", html: htmlInfo });
        }
      }
    } catch {}

    return NextResponse.json({ ok: true, appointmentId: created.id });
  } catch (e) {
    console.error("[accept] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
