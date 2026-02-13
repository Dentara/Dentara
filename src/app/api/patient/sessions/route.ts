// app/api/patient/sessions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function parseUA(ua: string) {
  // OS
  let os = "Unknown OS";
  if (/Windows NT 10/.test(ua)) os = "Windows 10";
  else if (/Windows NT 11/.test(ua)) os = "Windows 11";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  // Browser + version (major)
  let browser = "Unknown";
  let major = "";
  let m: RegExpExecArray | null = null;

  if (/Edg\//.test(ua)) {
    browser = "Edge";
    m = /Edg\/([\d.]+)/.exec(ua);
  } else if (/Chrome\//.test(ua)) {
    browser = "Chrome";
    m = /Chrome\/([\d.]+)/.exec(ua);
  } else if (/Firefox\//.test(ua)) {
    browser = "Firefox";
    m = /Firefox\/([\d.]+)/.exec(ua);
  } else if (/Safari/.test(ua)) {
    browser = "Safari";
    m = /Version\/([\d.]+)/.exec(ua);
  }
  if (m?.[1]) major = m[1].split(".")[0];

  const deviceShort = major ? `${browser} ${major} on ${os}` : `${browser} on ${os}`;
  return { deviceShort, os, browser, major };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const h = await headers();
  const ua = h.get("user-agent") || "";

  const { deviceShort, os, browser, major } = parseUA(ua);

  // IP normalize
  const xf = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipRaw = xf || h.get("x-real-ip") || "::1";
  const ip =
    ipRaw === "::1" ? "127.0.0.1" :
    ipRaw.startsWith("::ffff:") ? ipRaw.replace("::ffff:", "") :
    ipRaw;

  return NextResponse.json({
    sessions: [
      {
        id: "current",
        deviceShort,          // <— qısa və dəqiq
        deviceUA: ua,         // istəsən göstərməyək
        browser,
        os,
        version: major,
        ip,
        lastSeen: new Date().toISOString(),
        current: true,
      },
    ],
  });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const exceptThis = url.searchParams.get("except") === "this";

  return NextResponse.json({
    ok: true,
    note:
      "Stateless JWT mode: only current session is known. DB-backed sessions will enable revocation.",
    exceptThis,
  });
}
