import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user: any = session?.user;
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
    if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

    const since = new Date();
    since.setDate(since.getDate() - 7);

    const items = await prisma.appointment.findMany({
      where: { clinicId, createdAt: { gte: since } },
      include: {
        patient: { select: { name: true, image: true } },
        doctor:  { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/clinic/appointments/recent", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
