import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/app/libs/email";

export const dynamic = "force-dynamic";

function parseDate(input?: string | null): Date | undefined {
  if (!input || typeof input !== "string") return undefined;
  if (input.includes("T")) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const [y, m, d] = input.split("-").map((x) => parseInt(x || "0", 10));
  if (!y || !m || !d) return undefined;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

// URL-dən id
function extractRequestIdFromUrl(req: Request): string | undefined {
  try {
    const p = new URL(req.url).pathname.split("/");
    return p[p.length - 2] || undefined; // .../requests/:id/propose
  } catch {
    return undefined;
  }
}

/**
 * PATCH /api/clinic/appointments/requests/:id/propose
 * Body: { date:"YYYY-MM-DD", time:"HH:mm", endTime?:"HH:mm" }
 * Effekt:
 *   - status="proposed"
 *   - proposedDate/Time/EndTime yazılır (transaction)
 *   - PatientNotification (request_proposed)
 *   - Pasiyentə email (MAIL_NOTIFY = patient|doctor|both; defolt patient)
 */
export async function PATCH(req: Request) {
  try {
    const id = extractRequestIdFromUrl(req);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const date = parseDate(body?.date);
    const time = typeof body?.time === "string" ? body.time : undefined;
    const endTime = typeof body?.endTime === "string" ? body.endTime : undefined;
    if (!date || !time) {
      return NextResponse.json({ error: "date and time required" }, { status: 400 });
    }

    // --- 1) Transaction: proposed sahələr + status ---
    let updated = await prisma.$transaction(async (tx) => {
      // İlk cəhd: proposed sahələr + status
      try {
        const u = await tx.appointmentRequest.update({
          where: { id },
          data: {
            proposedDate: date,
            proposedTime: time,
            proposedEndTime: endTime,
            status: "proposed",
          },
          include: {
            patient: { select: { id: true, email: true } },
            clinic: { select: { name: true } },
          },
        });
        return u;
      } catch {
        // Schema hələ düşməyibsə – ən azı tarix/vaxt-ı saxla, status-u da yenə cəhd et
        try {
          const u = await tx.appointmentRequest.update({
            where: { id },
            data: {
              date,
              time,
              ...(endTime ? { endTime } : {}),
              status: "proposed",
            } as any,
            include: {
              patient: { select: { id: true, email: true } },
              clinic: { select: { name: true } },
            },
          });
          return u;
        } catch {
          // son fallback: yalnız date/time (status toxunmur)
          const u = await tx.appointmentRequest.update({
            where: { id },
            data: {
              date,
              time,
              ...(endTime ? { endTime } : {}),
            },
            include: {
              patient: { select: { id: true, email: true } },
              clinic: { select: { name: true } },
            },
          });
          return u;
        }
      }
    });

    // --- 2) Notification (guard ilə) ---
    try {
      const canNotify =
        (prisma as any)?.patientNotification &&
        typeof (prisma as any).patientNotification.create === "function";

      if (canNotify) {
        let patientId = updated?.patient?.id;
        if (!patientId && updated?.patient?.email) {
          patientId = (
            await prisma.patient.findFirst({
              where: { email: updated.patient.email },
              select: { id: true },
            })
          )?.id;
        }
        if (patientId) {
          await (prisma as any).patientNotification.create({
            data: {
              patientId,
              type: "request_proposed",
              title: "New time proposed",
              message: `Clinic proposed ${body?.date ?? ""} ${time}${endTime ? "–" + endTime : ""}`,
              isRead: false,
            },
          });
        }
      }
    } catch (e) {
      console.error("[propose] notification error (soft):", e);
    }

    // --- 3) Email (soft) ---
    try {
      const to = updated?.patient?.email || null;
      if (to) {
        const d = date.toISOString().slice(0, 10);
        const html = `
          <p>Your clinic <b>${updated?.clinic?.name || "Clinic"}</b> proposed a new time for your appointment request.</p>
          <p><b>Date:</b> ${d} &nbsp; <b>Time:</b> ${time}${endTime ? " – " + endTime : ""}</p>
          <p>Please open your Dentara dashboard to review (Accept/Decline).</p>
        `;
        const notify = (process.env.MAIL_NOTIFY || "patient").toLowerCase();
        if (notify === "patient" || notify === "both") {
          await sendEmail({ to, subject: "Dentara — New time proposed", html });
        }
      }
    } catch (e) {
      console.error("[propose email] failed:", e);
    }

    return NextResponse.json({ ok: true, id: updated?.id, status: updated?.status });
  } catch (e) {
    console.error("[propose] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
