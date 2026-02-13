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

  const rows = await prisma.appointment.groupBy({
    by: ["type"],
    where: { clinicId },
    _count: { _all: true },
  });

  const data = rows.map(r => ({
    name: r.type || "Other",
    value: r._count._all,
  }));

  return NextResponse.json(data);
}
