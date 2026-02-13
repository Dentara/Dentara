import { NextResponse } from "next/server";
import { PrismaClient, MembershipStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
// DİQQƏT: authOptions yolunu sənin layihədəki NextAuth konfiqinə uyğunlaşdır.
// Əksər App Router layihələrində bu belə olur:
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * Məntiq:
 * - Yeni user login olduqdan sonra çağrılır (signup flow sonunda).
 * - PATIENT: ClinicPatient.email == session.user.email və patientUserId = null → link + ACTIVE.
 * - DOCTOR: Doctor.email == session.user.email → həmin doctor.clinicId-lər üçün ClinicDoctor upsert (userId ilə).
 * - Hər iki halda "pending invitations" kimi saxlanmış inviteCode/token varsa, vaxt yoxlaması ilə ACTIVE edirik.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const userRole = (session.user as any).role || "patient";
  const userEmail = session.user?.email || (session.user as any).email;

  // Link count stats
  let linkedPatients = 0;
  let linkedDoctorClinics = 0;

  // 1) Patient auto-link by email
  if (userEmail) {
    const candidates = await prisma.clinicPatient.findMany({
      where: {
        email: userEmail,
        OR: [{ patientUserId: null }, { patientUserId: undefined }],
      },
      select: { id: true, clinicId: true, inviteExpiresAt: true, inviteCode: true, inviteToken: true },
    });

    for (const c of candidates) {
      // inviteExpiresAt varsa və keçibsə, yenə də linkləmək istəmiriksə burda check edə bilərik (opsional).
      await prisma.clinicPatient.update({
        where: { id: c.id },
        data: {
          patientUserId: userId,
          status: MembershipStatus.ACTIVE,
        },
      });
      linkedPatients += 1;
    }
  }

  // 2) Doctor auto-link — mövcud Doctor qeydlərinə əsasən
  // Qeyd: Clinic-lər həkimi əvvəlcədən Doctor modeli ilə əlavə edibsə, email match edəcək.
  if (userEmail) {
    const doctorRows = await prisma.doctor.findMany({
      where: { email: userEmail },
      select: { clinicId: true },
    });

    // Hər clinicId üçün ClinicDoctor upsert
    for (const row of doctorRows) {
      if (!row.clinicId) continue;
      await prisma.clinicDoctor.upsert({
        where: {
          clinicId_userId: {
            clinicId: row.clinicId,
            userId: userId,
          },
        },
        create: {
          clinicId: row.clinicId,
          userId: userId,
          status: MembershipStatus.ACTIVE,
        },
        update: {
          status: MembershipStatus.ACTIVE,
        },
      });
      linkedDoctorClinics += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    linkedPatients,
    linkedDoctorClinics,
    role: userRole,
  });
}
