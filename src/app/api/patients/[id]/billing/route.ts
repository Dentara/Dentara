import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 

  try {
    const bills = await prisma.billing.findMany({
      where: { patientId: params.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch billing history" }, { status: 500 });
  }
}
