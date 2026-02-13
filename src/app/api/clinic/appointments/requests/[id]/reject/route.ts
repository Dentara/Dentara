import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/clinic/appointments/requests/:id/reject
 * Body (optional): { reason?: string }
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({} as { reason?: string }));

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
    if (request.status !== "pending") {
      return NextResponse.json({ error: `Request already ${request.status}` }, { status: 400 });
    }

    await prisma.appointmentRequest.update({
      where: { id },
      data: { status: "rejected" },
    });

    // Optional: notify patient & doctor
    try {
      const clinicName = request.clinic?.name || "Clinic";
      const reason = body?.reason ? `<p>Reason: ${body.reason}</p>` : "";
      const html = `<p>Your appointment request at <b>${clinicName}</b> was rejected.</p>${reason}`;

      if (request.patient?.email) {
        await sendEmail({ to: request.patient.email, subject: "Dentara — Appointment Request Rejected", html });
      }
      if (request.doctor?.email) {
        await sendEmail({ to: request.doctor.email, subject: "Dentara — Appointment Request Rejected", html });
      }
    } catch (e) {
      console.error("[reject] email error:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /requests/:id/reject] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
