import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";

const CK = {
  lang: "tgz_pref_lang",
  tz: "tgz_pref_tz",
  notif: "tgz_pref_notif",
  mkt: "tgz_pref_mkt",
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const store = await cookies(); // Next 15: cookies() async
  return NextResponse.json({
    prefs: {
      language: store.get(CK.lang)?.value || "en",
      timezone: store.get(CK.tz)?.value || "UTC",
      emailNotifications: store.get(CK.notif)?.value || "IMPORTANT",
      marketingOptIn: (store.get(CK.mkt)?.value || "0") === "1",
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const language = typeof body?.language === "string" ? body.language : "en";
  const timezone = typeof body?.timezone === "string" ? body.timezone : "UTC";
  const emailNotifications = typeof body?.emailNotifications === "string" ? body.emailNotifications : "IMPORTANT";
  const marketingOptIn = !!body?.marketingOptIn;

  const res = NextResponse.json({ ok: true });
  const oneYear = 60 * 60 * 24 * 365;
  res.cookies.set({ name: CK.lang, value: language, path: "/", httpOnly: true, sameSite: "lax", maxAge: oneYear });
  res.cookies.set({ name: CK.tz, value: timezone, path: "/", httpOnly: true, sameSite: "lax", maxAge: oneYear });
  res.cookies.set({ name: CK.notif, value: emailNotifications, path: "/", httpOnly: true, sameSite: "lax", maxAge: oneYear });
  res.cookies.set({ name: CK.mkt, value: marketingOptIn ? "1" : "0", path: "/", httpOnly: true, sameSite: "lax", maxAge: oneYear });
  return res;
}
