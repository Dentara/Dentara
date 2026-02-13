import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { headers, cookies } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

function parseUA(ua: string) {
  let os = "Unknown OS";
  if (/Windows NT 11/.test(ua)) os = "Windows 11";
  else if (/Windows NT 10/.test(ua)) os = "Windows 10";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let browser = "Unknown";
  let major = "";
  let m: RegExpExecArray | null = null;
  if (/Edg\//.test(ua)) { browser = "Edge"; m = /Edg\/([\d.]+)/.exec(ua); }
  else if (/Chrome\//.test(ua)) { browser = "Chrome"; m = /Chrome\/([\d.]+)/.exec(ua); }
  else if (/Firefox\//.test(ua)) { browser = "Firefox"; m = /Firefox\/([\d.]+)/.exec(ua); }
  else if (/Safari/.test(ua)) { browser = "Safari"; m = /Version\/([\d.]+)/.exec(ua); }
  if (m?.[1]) major = m[1].split(".")[0];

  const device = major ? `${browser} ${major} on ${os}` : `${browser} on ${os}`;
  return { device, os, browser, major };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const h = await headers();
  const ua = h.get("user-agent") || "";
  const xf = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipRaw = xf || h.get("x-real-ip") || "::1";
  const ip = ipRaw === "::1" ? "127.0.0.1" : ipRaw.startsWith("::ffff:") ? ipRaw.replace("::ffff:", "") : ipRaw;
  const device = parseUA(ua).device;

  // cihaz cookie-si (mövcud sessiyanı ayırd etmək üçün)
  const store = await cookies();
  let sid = store.get("tgz_sid")?.value;
  if (!sid) sid = crypto.randomBytes(16).toString("hex");

  // DB-yə yaz/yenilə
  const now = new Date();
  const rec = await prisma.accountSession.upsert({
    where: { id: sid },
    update: { userId: u.id, userAgent: ua, ip, device, lastSeen: now, revokedAt: null },
    create: { id: sid, userId: u.id, userAgent: ua, ip, device, lastSeen: now },
    select: { id: true },
  });

  const res = NextResponse.json({ ok: true, currentSessionId: rec.id });
  // cookie-ni 30 gün saxla
  res.cookies.set({
    name: "tgz_sid",
    value: rec.id,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
