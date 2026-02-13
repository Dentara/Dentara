export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET /api/account/verify-email?token=...
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    if (!token.includes(".")) {
      return NextResponse.json({ ok: false, error: "INVALID_TOKEN" }, { status: 400 });
    }
    const [payloadB64, sig] = token.split(".");
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson || "{}") as { uid?: string; email?: string; ts?: number };

    const secret = process.env.EMAIL_VERIFY_SECRET || "tagiza-dev-secret";
    const expected = crypto.createHmac("sha256", secret).update(payloadJson).digest("hex");
    if (sig !== expected) {
      return NextResponse.json({ ok: false, error: "BAD_SIGNATURE" }, { status: 400 });
    }

    if (!payload?.uid || !payload?.email) {
      return NextResponse.json({ ok: false, error: "MALFORMED" }, { status: 400 });
    }

    // OPTIONAL: token vaxt limiti (24h)
    if (payload.ts && Date.now() - payload.ts > 1000 * 60 * 60 * 24) {
      return NextResponse.json({ ok: false, error: "EXPIRED" }, { status: 400 });
    }

    // DB-də emailVerified yenilə
    await prisma.user.update({
      where: { id: payload.uid },
      data: { emailVerified: new Date() },
      select: { id: true },
    });

    // Sadə HTML cavab (redirect də edə bilərik)
    const html = `<!doctype html><html><body style="font:16px/1.4 system-ui;padding:24px">
      <h1>Email verified ✅</h1>
      <p>Your email has been successfully verified.</p>
      <p><a href="/dashboard/doctor-self/profile?tab=security">Back to profile</a></p>
      <script>setTimeout(()=>{ window.close?.(); }, 1500)</script>
    </body></html>`;
    return new NextResponse(html, { headers: { "content-type": "text/html" } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "INTERNAL", detail: e?.message }, { status: 500 });
  }
}
