import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/patient/appointments/requests/:id/cancel
 */
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const request = await prisma.appointmentRequest.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (request.status !== "pending") {
      return NextResponse.json({ error: `Request already ${request.status}` }, { status: 400 });
    }

    await prisma.appointmentRequest.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH patient cancel] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
