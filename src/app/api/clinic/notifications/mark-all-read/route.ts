import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/clinic/notifications/mark-all-read
 * Bütün readAt=null clinic notificationlarını read edir.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const clinicId =
    role === "clinic" ? ((session?.user as any)?.id as string) : undefined;

  if (!clinicId) return NextResponse.json({ ok: false });

  await prisma.notification.updateMany({
    where: {
      scope: "clinic",
      clinicId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
