import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const clinicId = "demo-clinic-id";
  const now = new Date();
  const year = now.getFullYear();

  const monthlyData = await Promise.all(
    Array.from({ length: 12 }).map(async (_, monthIndex) => {
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0);

      const [revenue, patients] = await Promise.all([
        prisma.billing.aggregate({
          _sum: { amount: true },
          where: {
            clinicId,
            createdAt: { gte: start, lte: end },
          },
        }),
        prisma.clinicPatient.count({
          where: {
            clinicId,
            createdAt: { gte: start, lte: end },
          },
        }),
      ]);

      return {
        name: start.toLocaleString("default", { month: "short" }),
        total: revenue._sum.amount ?? 0,
        patients,
      };
    })
  );

  return NextResponse.json(monthlyData);
}
