import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";
import { sendVerificationEmail } from "@/app/libs/email"; // mövcuddur

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.email || !u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Əgər artıq verified-dirsə, göndərməyə ehtiyac yoxdur
  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { emailVerified: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  // Token hazırla (15 dəq)
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  // Köhnə tokenləri sil, yenisini yaz (sənin sxemin fərqli ola bilər – klassik VerificationToken)
  await prisma.verificationToken?.deleteMany?.({ where: { identifier: u.email } }).catch(() => {});
  await prisma.verificationToken?.create?.({
    data: { identifier: u.email, token, expires },
  });

  // Email göndər
  await sendVerificationEmail(u.email, token);

  return NextResponse.json({ ok: true });
}
