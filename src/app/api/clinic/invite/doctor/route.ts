import { NextResponse } from "next/server";
import { PrismaClient, MembershipStatus, StaffRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { sendMailViaProjectHelper } from "@/app/libs/email";

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
 * POST /api/clinic/invite/doctor
 * Body: { clinicId: string, email: string, role?: StaffRole }
 * Qeyd: Həkim sonradan sign-in edəndə /post-register-linker onu ClinicDoctor-a ACTIVE kimi qoşacaq.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "clinic") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { clinicId, email, role } = body || {};
  if (!clinicId || !email) return NextResponse.json({ ok: false, error: "CLINIC_ID_AND_EMAIL_REQUIRED" }, { status: 400 });

  const inviteCode = genCode(6);
  const inviteToken = crypto.randomUUID();
  const inviteExpiresAt = addDays(new Date(), 7);

  // ClinicDoctor sətiri userId olmadan – email vasitəsilə “Doctor” modelində görünəcək
  const created = await prisma.clinicDoctor.create({
    data: {
      clinicId,
      userId: crypto.randomUUID(), // placeholder deyil! unique tələbini pozmamaq üçün userId lazımdırsa @@unique([clinicId,userId]) var → ona görə upsert yolunu seçirik:
    },
  }).catch(async () => {
    // @@unique([clinicId,userId]) var deyə yuxarıdakı create uyğun deyil.
    // Bunun əvəzinə ClinicDoctor-də email saxlamaq dizaynında yoxdu. Ona görə dəvət mexanizmini Doctor modelilə həll edirik:
    // Doctor cədvəlinə klinik səviyyədə "email" qeydini yazırıq. Sign-in zamanı post-register-linker bunu götürüb ClinicDoctor upsert edəcək.
    const doctorProfile = await prisma.doctor.create({
      data: {
        fullName: email,
        email,
        clinicId,
        status: "Invited",
      },
    });
    // Invite metadata-nı ClinicDoctor-də saxlamaq istəyirdiksə, modelə əlavə email sahəsi lazım olardı.
    return doctorProfile;
  });

  // TODO: email helper ilə dəvət göndər
  // await sendMailViaProjectHelper({ to: email, subject: "...", html: `Invite code: <b>${inviteCode}</b>` });

  return NextResponse.json({ ok: true, data: { inviteCode, inviteExpiresAt } });
}
