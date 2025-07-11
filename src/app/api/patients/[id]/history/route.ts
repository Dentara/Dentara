import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 

  try {
    const history = await prisma.patient.findUnique({
      where: { id: params.id },
      select: {
        diagnoses: true,
        visits: true,
        procedures: true,
        immunizations: true,
      },
    });

    if (!history) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/patient/[id]/history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
