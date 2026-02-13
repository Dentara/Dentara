import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const doctorId = role === "doctor" ? ((session?.user as any)?.id as string) : undefined;

  if (!doctorId) return NextResponse.json({ ok: false });

  await prisma.notification.updateMany({
    where: { scope: "doctor", doctorId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
