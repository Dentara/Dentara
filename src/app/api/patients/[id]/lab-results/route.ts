import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 

  try {
    const labResults = await prisma.labResult.findMany({
      where: { patientId: params.id },
      orderBy: { date: "desc" },
      include: { results: true },
    });

    return NextResponse.json(labResults);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lab results" }, { status: 500 });
  }
}
