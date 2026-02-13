import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function monthBounds(year: number, monthIndex: number) {
  // monthIndex: 0=Jan ... 11=Dec
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user: any = session?.user;
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
    if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

    const now = new Date();
    const months: { name: string; start: Date; end: Date }[] = [];

    // Son 6 ay (indiki ay daxil)
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = monthBounds(ref.getFullYear(), ref.getMonth());
      months.push({ name: monthLabel(ref), start, end });
    }

    // Hər ay üçün həm billing (revenue), həm də appointments (patients) hesablayaq
    const results = [];
    for (const m of months) {
      const [sum, visits] = await Promise.all([
        prisma.billing.aggregate({
          _sum: { amount: true },
          where: { clinicId, createdAt: { gte: m.start, lte: m.end } },
        }),
        prisma.appointment.count({
          where: { clinicId, createdAt: { gte: m.start, lte: m.end } },
        }),
      ]);

      results.push({
        name: m.name,
        total: sum._sum.amount ?? 0,   // revenue
        patients: visits,              // vizit sayı (appointments)
      });
    }

    return NextResponse.json(results);
  } catch (e) {
    console.error("GET /api/clinic/stats/monthly error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
