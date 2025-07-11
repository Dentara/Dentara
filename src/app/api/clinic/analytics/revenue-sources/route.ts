import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const clinicId = "demo-clinic-id";

  const results = await prisma.billing.groupBy({
    by: ["department"],
    where: { clinicId },
    _sum: { amount: true },
  });

  const transformed = results.map(item => ({
    name: item.department || "Unknown",
    revenue: item._sum.amount ?? 0,
  }));

  return NextResponse.json(transformed);
}
