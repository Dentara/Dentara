// app/api/treatments/[id]/review/remind/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/app/libs/email";

export const runtime = "nodejs";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: session.user.id as string,
    role: (session.user as any).role as string | undefined,
    email: session.user.email ?? undefined,
  };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Yalnız clinic / doctor / admin göndərə bilər
  if (!["clinic", "doctor", "admin"].includes(user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: treatmentId } = await ctx.params;

  const treatment = await prisma.treatmentEntry.findUnique({
    where: { id: treatmentId },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      patientUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      doctor: {
        select: {
          fullName: true,
        },
      },
      clinic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!treatment) {
    return NextResponse.json({ error: "Treatment not found" }, { status: 404 });
  }

  // ===== Pasiyent EMAIL üçün fallback zənciri =====
  let patientEmail: string | null =
    treatment.patient?.email ??
    treatment.patientUser?.email ??
    null;

  // Əgər hələ də email yoxdursa, ClinicPatient-dən cəhd et (join pasiyent üçün)
  let clinicPatientFullName: string | null = null;

  if (!patientEmail && treatment.clinicId && treatment.patientUserId) {
    try {
      const cp = await prisma.clinicPatient.findFirst({
        where: {
          clinicId: treatment.clinicId,
          patientUserId: treatment.patientUserId,
        },
        select: { email: true, fullName: true },
      });
      if (cp?.email) {
        patientEmail = cp.email;
      }
      if (cp?.fullName) {
        clinicPatientFullName = cp.fullName;
      }
    } catch {}
  }

  if (!patientEmail) {
    return NextResponse.json(
      { error: "Patient email not found for this treatment" },
      { status: 404 }
    );
  }

  // ===== Pasiyent ADI üçün fallback zənciri =====
  const patientName =
    clinicPatientFullName ??
    treatment.patient?.name ??
    treatment.patientUser?.name ??
    "Dear patient";

  const doctorName = treatment.doctor?.fullName ?? "your doctor";
  const clinicName = treatment.clinic?.name ?? "our clinic";

  // origin hesablamaq (staging/prod fərq etmir)
  const originHeader = req.headers.get("origin");
  const host = req.headers.get("host");
  const origin =
    originHeader ||
    (host
      ? `https://${host}`
      : process.env.NEXT_PUBLIC_APP_URL || "https://tagiza.com");

  const reviewUrl = `${origin}/dashboard/patient-self/treatments?review=${encodeURIComponent(
    treatmentId
  )}`;

  const subject = "Please review your recent treatment";
  const html = `
    <p>Hi ${patientName},</p>
    <p>You recently received treatment at <strong>${clinicName}</strong> with <strong>${doctorName}</strong>.</p>
    <p>We would be grateful if you could take a moment to rate your experience and leave a short review.</p>
    <p><a href="${reviewUrl}" target="_blank">Click here to open your treatment history and leave a review</a></p>
    <p>Thank you!</p>
  `;

  try {
    await sendEmail({
      to: patientEmail,
      subject,
      html,
    });
  } catch (e) {
    console.error("Failed to send review reminder email", e);
    // Frontend-i bloklamayaq
    return NextResponse.json({
      ok: false,
      error: "Email send failed (logged)",
    });
  }

  return NextResponse.json({ ok: true });
}
