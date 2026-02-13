import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/patient/notifications/unread-count?patientEmail=...
 * Cavab: { count: number }
 *
 * Sabitlik üçün:
 *  - bütün null/undefined hallarına qarşı qoruma
 *  - patientId string kimi ayrı dəyişəndə saxlanır (p?.id istifadə etmədən)
 *  - səhv olduqda 0 qaytarır
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientEmail = searchParams.get("patientEmail") || "";

    if (!patientEmail) {
      return NextResponse.json({ count: 0 });
    }

    const p = await prisma.patient.findFirst({
      where: { email: patientEmail },
      select: { id: true },
    });

    const patientId: string | undefined = p?.id ?? undefined;
    if (!patientId) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.patientNotification.count({
      where: { patientId, isRead: false },
    });

    return NextResponse.json({ count });
  } catch (e) {
    // Konsolu çirkləndirməmək üçün yumşaq cavab
    // console.error("[GET /patient/notifications/unread-count] error:", e);
    return NextResponse.json({ count: 0 });
  }
}
