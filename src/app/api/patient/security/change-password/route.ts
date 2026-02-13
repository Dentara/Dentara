import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const oldPassword = String(body?.oldPassword || "");
  const newPassword = String(body?.newPassword || "");
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, password: true },
  });
  if (!user?.password) {
    return NextResponse.json({ error: "Password not set" }, { status: 400 });
  }

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) return NextResponse.json({ error: "Wrong current password" }, { status: 400 });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: u.id },
    data: { password: hash },
  });

  return NextResponse.json({ ok: true });
}
