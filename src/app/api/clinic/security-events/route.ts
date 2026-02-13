// app/api/clinic/security-events/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id || u?.role !== "clinic") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || "50");
  const limit = Math.min(Math.max(limitParam || 50, 10), 200); // 10–200 arası

  const daysParam = Number(url.searchParams.get("days") || "30");
  const days = Math.min(Math.max(daysParam || 30, 1), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.securityEvent.findMany({
    where: {
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ events });
}
