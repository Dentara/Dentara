export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const token = url.searchParams.get("token");

  const backOk  = new URL("/auth/signin?verified=1", origin);
  const backBad = new URL("/auth/signin?verified=0", origin);

  try {
    if (!token) return NextResponse.redirect(backBad);

    const rec = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!rec || rec.expiresAt < new Date()) return NextResponse.redirect(backBad);

    await prisma.user.update({
      where: { email: rec.email.toLowerCase() },
      data: { emailVerified: new Date() },
    });
    await prisma.emailVerificationToken.delete({ where: { token } });

    return NextResponse.redirect(backOk);
  } catch {
    return NextResponse.redirect(backBad);
  }
}
