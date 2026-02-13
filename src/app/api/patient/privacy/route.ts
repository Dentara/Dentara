import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const CK = {
  showName: "tgz_priv_show_name",
  shareRecords: "tgz_priv_share_records",
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const store = await cookies();
  return NextResponse.json({
    privacy: {
      showNameToLinkedClinics: (store.get(CK.showName)?.value || "1") === "1",
      shareRecordsByDefault: (store.get(CK.shareRecords)?.value || "0") === "1",
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const showName = !!body?.showNameToLinkedClinics;
  const shareRecords = !!body?.shareRecordsByDefault;

  const res = NextResponse.json({ ok: true });
  const oneYear = 60 * 60 * 24 * 365;

  res.cookies.set({ name: CK.showName, value: showName ? "1" : "0", httpOnly: true, sameSite: "lax", path: "/", maxAge: oneYear });
  res.cookies.set({ name: CK.shareRecords, value: shareRecords ? "1" : "0", httpOnly: true, sameSite: "lax", path: "/", maxAge: oneYear });

  return res;
}
