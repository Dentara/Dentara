import { NextResponse } from "next/server";
import { PrismaClient, MembershipStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { sendMailViaProjectHelper } from "@/app/libs/email"; // mövcuddursa aç

const prisma = new PrismaClient();

function genCode(len = 6) {
  const s = "0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += s[Math.floor(Math.random() * s.length)];
  return out;
}
function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}

/**
 * POST /api/clinic/invite/patient
 * Body:
 *  {
 *    clinicId: string,
 *    fullName?: string,
 *    email?: string,  // email varsa auto-link üçün əsas siqnaldır
 *    phone?: string
 *  }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "clinic") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { clinicId, fullName, email, phone } = body || {};
  if (!clinicId) return NextResponse.json({ ok: false, error: "CLINIC_ID_REQUIRED" }, { status: 400 });

  // dəvət kodu/token
  const inviteCode = genCode(6);
  const inviteToken = crypto.randomUUID();
  const inviteExpiresAt = addDays(new Date(), 7);

  // eyni email varsa həmin sətirdə yenilə, yoxdursa create
  const created = await prisma.clinicPatient.create({
    data: {
      clinicId,
      fullName: fullName || email || phone || "Patient",
      email: email ?? null,
      phone: phone ?? null,
      status: MembershipStatus.INVITED,
      inviteCode,
      inviteToken,
      inviteExpiresAt,
    },
  });

  // TODO: email göndərişi (Resend/SMTP) – mövcud helper varsa aç
  // if (email) {
  //   await sendMailViaProjectHelper({
  //     to: email,
  //     subject: `Clinic invitation to Dentara`,
  //     html: `<p>You have been invited to link with clinic.</p>
  //            <p>Your invite code: <b>${inviteCode}</b> (valid 7 days)</p>`
  //   });
  // }

  return NextResponse.json({ ok: true, data: { id: created.id, inviteCode, inviteExpiresAt } });
}
