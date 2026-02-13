import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

/** Decline:
 * status "pending" edilir; proposed* dəyərləri saxlayırıq (klinika baxış üçün).
 */
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const r = await prisma.appointmentRequest.update({
      where: { id },
      data: { status: "pending" },
      include: {
        clinic: { select: { name: true /* , email: true */ } },
        doctor: { select: { fullName: true, email: true } },
        patient: { select: { name: true, email: true } },
      },
    });

    // Klinikaya/həkimə e-poçt
    try {
      const notify = (process.env.MAIL_NOTIFY || "patient").toLowerCase();
      const htmlInfo = `
        <p>Patient <b>${r.patient?.name || ""}</b> declined the proposed time.</p>
        <p>Request returned to <b>pending</b> for review.</p>`;
      if (notify === "doctor" || notify === "both") {
        if (r.doctor?.email) {
          await sendEmail({ to: r.doctor.email, subject: "Dentara — Patient declined", html: htmlInfo });
        }
      }
    } catch (e) {
      console.error("[decline] email error:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[decline] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
