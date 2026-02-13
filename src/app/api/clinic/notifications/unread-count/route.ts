// app/api/clinic/notifications/unread-count/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const clinicId = role === "clinic" ? ((session?.user as any)?.id as string) : undefined;

  if (!clinicId) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.notification.count({
    where: {
      scope: "clinic",
      clinicId,
      readAt: null,
    },
  });

  return NextResponse.json({ count });
}
