// app/api/patients/[id]/membership/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Body = {
  action: "approve" | "reject";
};

/**
 * POST /api/patients/[id]/membership
 *
 * - id → ClinicPatient.id
 * - Yalnız clinic user üçün icazə
 * - Approve → ClinicPatient.status = ACTIVE
 * - Reject  → ClinicPatient silinir
 * - Hər ikisində uyğun PATIENT_JOIN_REQUEST notification-lar read işarələnir
 *
 * QƏSDƏN Patient.create ETMİRİK – Patient modelini ayrıca, schema əsasında quracağıq.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const clinicId =
    role === "clinic" ? ((session?.user as any)?.id as string) : undefined;

  if (!clinicId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_BODY" },
      { status: 400 }
    );
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json(
      { ok: false, error: "BAD_ACTION" },
      { status: 400 }
    );
  }

  const membership = await prisma.clinicPatient.findUnique({
    where: { id },
  });

  if (!membership || membership.clinicId !== clinicId) {
    return NextResponse.json(
      { ok: false, error: "NOT_FOUND" },
      { status: 404 }
    );
  }

  // ===== APPROVE =====
  if (body.action === "approve") {
    const updated = await prisma.clinicPatient.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });

    await prisma.notification.updateMany({
      where: {
        scope: "clinic",
        clinicId,
        type: "PATIENT_JOIN_REQUEST",
        readAt: null,
        payload: {
          path: ["clinicPatientId"],
          equals: id,
        },
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      status: updated.status,
    });
  }

  // ===== REJECT =====
  await prisma.clinicPatient.delete({
    where: { id },
  });

  await prisma.notification.updateMany({
    where: {
        scope: "clinic",
        clinicId,
        type: "PATIENT_JOIN_REQUEST",
        readAt: null,
        payload: {
          path: ["clinicPatientId"],
          equals: id,
        },
    },
    data: {
      readAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, status: "DELETED" });
}
