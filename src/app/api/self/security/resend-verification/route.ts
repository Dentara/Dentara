import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";
import { sendEmail } from "@/app/libs/email"; // səndə var

export const dynamic = "force-dynamic";

/** Base64url helper */
function b64url(input: Buffer | string) {
  const s = (input instanceof Buffer ? input : Buffer.from(input))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return s;
}

/** JWT-like (HS256) — heç bir əlavə paket olmadan */
function signToken(payload: Record<string, any>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = b64url(JSON.stringify(header));
  const encPayload = b64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.email || !u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // İstifadəçi artıq verified-dirsə, uğurla cavab ver və UI-da badge yenilənsin
  const user = await prisma.user.findUnique({
    where: { email: u.email },
    select: { id: true, emailVerified: true, name: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  // 15 dəqiqəlik token
  const exp = Math.floor(Date.now() / 1000) + 15 * 60;
  const secret = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || "TAGIZA_DEV_SECRET";

  const token = signToken({ uid: user.id, email: user.email, exp }, secret);

  // Link: self verify route-u
  const base = process.env.SITE_URL || "http://localhost:3000";
  const verifyUrl = `${base}/api/self/security/verify-email?token=${encodeURIComponent(token)}`;

  // Sadə HTML məktub (mövcud sendEmail funksiyasından istifadə)
  const html = `
    <p>Hello 👋,</p>
    <p>Please verify your email for <b>Tagiza</b> by clicking the button below (valid for 15 minutes):</p>
    <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563EB;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a></p>
    <p>If the button doesn't work, copy this link:</p>
    <p>${verifyUrl}</p>
  `;

  try {
    await sendEmail({
      to: user.email!,
      subject: "Verify your Tagiza account",
      html,
    });
  } catch (e) {
    console.error("resend email error:", e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: true });
}
