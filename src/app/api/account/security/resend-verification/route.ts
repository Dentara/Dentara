export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * Resend verification email (account-agnostic, independent from patient routes)
 * - POST only
 * - Returns:
 *    { ok: true, alreadyVerified: true }      → email artıq təsdiqlənib
 *    { ok: true, sent: true, verifyUrl }      → email təsdiqi üçün link (preview məqsədi ilə)
 *    { ok: false, error: "..." }              → xəta vəziyyətləri
 *
 * Qeyd: Burada DB-yə ayrıca token yazmırıq (sxem fərqliliklərinə ilişməmək üçün).
 * İstəsən, sonradan VerificationToken modeli ilə perzistent edərik.
 */

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(session.user as any).id) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // 1) Əgər artıq verified-dirsə, sadəcə bunu bildir
    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    // 2) Əks halda "simulated" verify URL hazırla (müstəqil işləyir)
    //    -- bu linki UI-da toast / modal kimi göstərə bilərsən (dev/prod üçün mailer inteqrasiyası əlavə olunacaq)
    const secret = process.env.EMAIL_VERIFY_SECRET || "tagiza-dev-secret";
    const payload = JSON.stringify({
      uid: user.id,
      email: user.email,
      ts: Date.now(),
    });
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const token = Buffer.from(payload).toString("base64url") + "." + sig;

    // İstəyə görə mövcud verify endpoint-ini göstəririk (sonradan tam implement edərik)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // Öz müstəqil yolumuzla uyğun (sonra real verify route yazarıq)
    const verifyUrl = `${baseUrl}/api/account/verify-email?token=${token}`;

    // Burada real mail göndərişi əvəzinə cavabla geri qaytarırıq.
    // Gələcəkdə mailer (Resend/SES/SMTP) inteqrasiya olunacaq.
    return NextResponse.json({
      ok: true,
      sent: true,
      preview: true, // dev göstəricisi
      verifyUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR", detail: e?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "METHOD_NOT_ALLOWED" }, { status: 405 });
}
