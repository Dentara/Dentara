import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Body-nin təhlükəsiz oxunuşu
async function readJsonSafe(req: Request): Promise<any> {
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return await req.json();
    }
    const txt = await req.text();
    if (!txt) return {};
    try {
      return JSON.parse(txt);
    } catch {
      return {};
    }
  } catch {
    return {};
  }
}

/**
 * PATCH /api/patient/notifications/read-all
 * Body: { patientEmail?: string, patientId?: string }
 * Cavab: { ok: true, updated: number }
 */
export async function PATCH(req: Request) {
  try {
    const body = (await readJsonSafe(req)) || {};
    const patientEmail: string = typeof body?.patientEmail === "string" ? body.patientEmail : "";
    const patientIdBody: string | undefined =
      typeof body?.patientId === "string" && body.patientId ? body.patientId : undefined;

    // 1) patientId varsa birbaşa istifadə edək
    let patientId: string | undefined = patientIdBody;

    // 2) patientEmail ilə tap (əgər patientId verilməyibsə)
    if (!patientId && patientEmail) {
      const p = await prisma.patient.findFirst({
        where: { email: patientEmail },
        select: { id: true },
      });
      patientId = p?.id ?? undefined;
    }

    // 3) heç biri yoxdursa, no-op (200, updated:0)
    if (!patientId) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    // 4) Oxunmamış bildirişləri read=true et
    const r = await prisma.patientNotification.updateMany({
      where: { patientId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ ok: true, updated: r.count });
  } catch (e) {
    // Soft-fail: UI qatını dayandırmamaq üçün 200 + updated:0
    // (istəsən logu aç: console.error("[notifications/read-all] error:", e);)
    return NextResponse.json({ ok: true, updated: 0 });
  }
}
