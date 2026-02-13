import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Siyahı
export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const currentId = (await cookies()).get("tgz_sid")?.value || null;

  const rows = await prisma.accountSession.findMany({
    where: { userId: u.id, revokedAt: null },
    orderBy: { lastSeen: "desc" },
    take: 50,
    select: { id: true, device: true, ip: true, lastSeen: true },
  });

  const sessions = rows.map(r => ({
    id: r.id,
    deviceShort: r.device,
    ip: r.ip,
    lastSeen: r.lastSeen.toISOString(),
    current: r.id === currentId,
  }));

  return NextResponse.json({ sessions, currentSessionId: currentId });
}

// Digər cihazlardan çıxış
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const store = await cookies();
  const currentId = store.get("tgz_sid")?.value || "";

  // yalnız digərlərini revoke et
  await prisma.accountSession.updateMany({
    where: { userId: u.id, id: { not: currentId } },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
