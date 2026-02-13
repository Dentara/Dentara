import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";

/** Base64url decode helper */
function b64urlToBuf(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s + pad, "base64");
}

function verifyToken(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [encHeader, encPayload, encSig] = parts;
  const data = `${encHeader}.${encPayload}`;
  const expected = crypto.createHmac("sha256", secret).update(data).digest();
  const got = b64urlToBuf(encSig);
  if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) {
    throw new Error("Bad signature");
  }
  const payload = JSON.parse(b64urlToBuf(encPayload).toString("utf8"));
  if (typeof payload.exp !== "number" || Date.now() / 1000 > payload.exp) {
    throw new Error("Token expired");
  }
  return payload as { uid: string; email: string; exp: number };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return new NextResponse("Missing token", { status: 400 });

  const secret = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || "TAGIZA_DEV_SECRET";

  try {
    const payload = verifyToken(token, secret);

    // EmailVerified = true
    await prisma.user.update({
      where: { id: payload.uid },
      data: { emailVerified: true },
    });

    // Redirect to app with success message (sadə)
    const redirectTo = (process.env.SITE_URL || "http://localhost:3000") + "/redirect?verified=1";
    return NextResponse.redirect(redirectTo);
  } catch (e) {
    console.error("verify-email error:", e);
    return new NextResponse("Invalid or expired token", { status: 400 });
  }
}
