// app/api/clinic/doctor-list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const clinicIdFromQuery = url.searchParams.get("clinicId") || undefined;
  const clinicId = clinicIdFromQuery || (session.user as any)?.clinicId || undefined;
  if (!clinicId) return NextResponse.json({ items: [] });

  // Əgər səndə join cədvəli (ClinicDoctor) varsa, bu hissəni uyğunlaşdırarıq.
  const items = await prisma.doctor.findMany({
    where: { clinicId },
    select: { id: true, fullName: true, email: true },
    take: 200,
    orderBy: [{ fullName: "asc" }],
  });

  return NextResponse.json({ items });
}
