import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
const CK = { lang:"tgz_pref_lang", tz:"tgz_pref_tz", notif:"tgz_pref_notif", mkt:"tgz_pref_mkt" };

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!s?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const store = await cookies();
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
  const s = await getServerSession(authOptions);
  if (!s?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const res = NextResponse.json({ ok: true });
  const oneYear = 60 * 60 * 24 * 365;

  res.cookies.set({ name: CK.lang, value: b.language || "en", path:"/", httpOnly:true, sameSite:"lax", maxAge: oneYear });
  res.cookies.set({ name: CK.tz, value: b.timezone || "UTC", path:"/", httpOnly:true, sameSite:"lax", maxAge: oneYear });
  res.cookies.set({ name: CK.notif, value: b.emailNotifications || "IMPORTANT", path:"/", httpOnly:true, sameSite:"lax", maxAge: oneYear });
  res.cookies.set({ name: CK.mkt, value: b.marketingOptIn ? "1" : "0", path:"/", httpOnly:true, sameSite:"lax", maxAge: oneYear });
  return res;
}
