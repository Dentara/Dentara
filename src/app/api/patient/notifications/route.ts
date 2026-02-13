import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientEmail = searchParams.get("patientEmail") || undefined;

    let patientId: string | undefined;
    if (patientEmail) {
      const p = await prisma.patient.findFirst({
        where: { email: patientEmail },
        select: { id: true },
      });
      if (p?.id) patientId = p.id;
    }
    if (!patientId) return NextResponse.json([]);

    const items = await prisma.patientNotification.findMany({
      where: { patientId },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error("[GET /patient/notifications] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
