// app/api/auth/resend/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendMailViaProjectHelper } from "@/app/libs/email-bridge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();

  const backOk  = new URL("/auth/signin?resend=1", origin);
  const backBad = new URL("/auth/signin?resend=0", origin);

  try {
    if (!email) return NextResponse.redirect(backBad);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.redirect(backBad);

    const token = crypto.randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.emailVerificationToken.create({
      data: { email, token, expiresAt: expires },
    });

    const verifyUrl = new URL(`/api/auth/verify?token=${encodeURIComponent(token)}`, origin).toString();

    await sendMailViaProjectHelper({
      to: email,
      subject: "Verify your email",
      html: `<p>Hi ${user.name ?? ""},</p><p>Please verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    return NextResponse.redirect(backOk);
  } catch (e) {
    console.error("resend error:", e);
    return NextResponse.redirect(backBad);
  }
}
