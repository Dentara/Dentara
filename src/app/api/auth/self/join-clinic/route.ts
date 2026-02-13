import { NextResponse } from "next/server";
import { PrismaClient, MembershipStatus, StaffRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * Body nümunələri:
 *  - { type: "patient", inviteCode: "123456" }
 *  - { type: "doctor", clinicId: "<clinic-id>" }  // inviteCodesiz qoşulma (clinic istəyinə görə)
 *  - { type: "patient", clinicId: "<clinic-id>", emailMatch: true } // email match ilə qoşulma
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const userId = session.user.id as string;
  const userEmail = session.user.email || (session.user as any).email || null;

  const body = await req.json().catch(() => ({}));
  const type = body?.type as "patient" | "doctor" | undefined;

  if (!type) {
    return NextResponse.json({ ok: false, error: "TYPE_REQUIRED" }, { status: 400 });
  }

  if (type === "patient") {
    const { inviteCode, clinicId, emailMatch } = body || {};

    // 1) Invite code üzrə tap-ve-link
    if (inviteCode) {
      const cp = await prisma.clinicPatient.findFirst({
        where: { inviteCode },
        select: { id: true, inviteExpiresAt: true },
      });
      if (!cp) return NextResponse.json({ ok: false, error: "INVALID_CODE" }, { status: 404 });

      // Expire yoxlaması (opsional)
      if (cp.inviteExpiresAt && cp.inviteExpiresAt < new Date()) {
        return NextResponse.json({ ok: false, error: "CODE_EXPIRED" }, { status: 400 });
      }

      const updated = await prisma.clinicPatient.update({
        where: { id: cp.id },
        data: { patientUserId: userId, status: MembershipStatus.ACTIVE },
      });
      return NextResponse.json({ ok: true, linked: true, clinicPatientId: updated.id });
    }

    // 2) Email match + clinicId (opsional)
    if (clinicId && emailMatch && userEmail) {
      const cp = await prisma.clinicPatient.findFirst({
        where: {
          clinicId,
          email: userEmail,
          OR: [{ patientUserId: null }, { patientUserId: undefined }],
        },
        select: { id: true },
      });
      if (!cp) return NextResponse.json({ ok: false, error: "NO_MATCH" }, { status: 404 });

      const updated = await prisma.clinicPatient.update({
        where: { id: cp.id },
        data: { patientUserId: userId, status: MembershipStatus.ACTIVE },
      });
      return NextResponse.json({ ok: true, linked: true, clinicPatientId: updated.id });
    }

    return NextResponse.json({ ok: false, error: "NEED_INVITE_CODE_OR_MATCH" }, { status: 400 });
  }

  if (type === "doctor") {
    const { clinicId, inviteCode } = body || {};
    // Variant A: inviteCode varsa, gələcəkdə ClinicDoctor-da inviteCode saxlayıb match edə bilərik.
    // Hazırda ClinicDoctor userId non-null olduğuna görə, sadə yol: clinicId ilə qoşulma (clinic təsdiqi UI-də ola bilər).
    if (!clinicId) {
      return NextResponse.json({ ok: false, error: "CLINIC_ID_REQUIRED" }, { status: 400 });
    }

    // Eyni klinikaya artıq bağlıdırsa, update etməyə ehtiyac yoxdur.
    const existing = await prisma.clinicDoctor.findUnique({
      where: { clinicId_userId: { clinicId, userId } },
    });
    if (existing) {
      if (existing.status !== MembershipStatus.ACTIVE) {
        await prisma.clinicDoctor.update({
          where: { clinicId_userId: { clinicId, userId } },
          data: { status: MembershipStatus.ACTIVE },
        });
      }
      return NextResponse.json({ ok: true, linked: true, clinicId, status: "ACTIVE" });
    }

    // Qoşulma (default DOCTOR rolu)
    await prisma.clinicDoctor.create({
      data: {
        clinicId,
        userId,
        role: StaffRole.DOCTOR,
        status: MembershipStatus.ACTIVE,
      },
    });

    return NextResponse.json({ ok: true, linked: true, clinicId, status: "ACTIVE" });
  }

  return NextResponse.json({ ok: false, error: "UNSUPPORTED_TYPE" }, { status: 400 });
}
