import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";
const CK = { showName: "tgz_priv_show_name", share: "tgz_priv_share_records" };

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!s?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const store = await cookies();
  return NextResponse.json({
    privacy: {
      showNameToLinkedClinics: (store.get(CK.showName)?.value || "1") === "1",
      shareRecordsByDefault: (store.get(CK.share)?.value || "0") === "1",
    },
  });
}

export async function PATCH(req: Request) {
  const s = await getServerSession(authOptions);
  if (!s?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const show = !!b?.showNameToLinkedClinics;
  const share = !!b?.shareRecordsByDefault;

  const res = NextResponse.json({ ok: true });
  const oneYear = 60 * 60 * 24 * 365;
  res.cookies.set({ name: CK.showName, value: show ? "1" : "0", httpOnly: true, sameSite: "lax", path: "/", maxAge: oneYear });
  res.cookies.set({ name: CK.share, value: share ? "1" : "0", httpOnly: true, sameSite: "lax", path: "/", maxAge: oneYear });
  return res;
}
