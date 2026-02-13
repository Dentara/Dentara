// app/api/account/security/change-password/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { validatePassword, PASSWORD_POLICY_MESSAGE } from "@/lib/passwordPolicy";
import { logSecurityEvent } from "@/lib/securityLog";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, email: true, password: true },
  });

  if (!user || !user.password) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    await logSecurityEvent({
      action: "PASSWORD_CHANGE_FAILED",
      userId: user.id,
      email: user.email,
      details: { reason: "wrong_current_password" },
    });
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const pwdCheck = validatePassword(newPassword);
  if (!pwdCheck.ok) {
    return NextResponse.json(
      { error: pwdCheck.message || PASSWORD_POLICY_MESSAGE },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  // İstəsən burada bütün digər sessiyaları revoke edə bilərik (AccountSession varsa)
  try {
    await prisma.accountSession.updateMany({
      where: { userId: user.id },
      data: { revokedAt: new Date() },
    });
  } catch {
    // əgər model yoxdur və ya dəyişibsə, sakit ignore
  }

  await logSecurityEvent({
    action: "PASSWORD_CHANGED",
    userId: user.id,
    email: user.email,
    details: { via: "self-service" },
  });

  return NextResponse.json({ ok: true });
}
