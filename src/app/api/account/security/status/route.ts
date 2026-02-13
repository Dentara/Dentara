export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });

  const u = await prisma.user.findUnique({
    where: { id: uid },
    select: { emailVerified: true, email: true },
  });

  return NextResponse.json({
    ok: true,
    email: u?.email || null,
    emailVerified: !!u?.emailVerified,
  });
}
