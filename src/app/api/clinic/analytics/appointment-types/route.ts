import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const clinicId = "demo-clinic-id";

  const results = await prisma.appointment.groupBy({
    by: ["reason"],
    where: { clinicId },
    _count: true,
  });

  const transformed = results.map(item => ({
    name: item.reason || "Other",
    value: item._count,
  }));

  return NextResponse.json(transformed);
}
