import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user: any = session?.user;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
  if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

  const results = await prisma.billing.groupBy({
    by: ["department"],
    where: { clinicId },
    _sum: { amount: true },
  });

  const transformed = results.map((item) => ({
    name: item.department || "Unknown",
    revenue: item._sum.amount ?? 0,
  }));

  return NextResponse.json(transformed);
}
