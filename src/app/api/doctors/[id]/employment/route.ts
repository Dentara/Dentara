import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Next 15: params Promise-dir, await etmək lazımdır
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user: any = session?.user;
    if (!user?.id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
    if (!clinicId) throw Object.assign(new Error("No clinicId bound"), { status: 403 });

    const { id: doctorId } = await ctx.params;

    const rows = await prisma.doctorEmploymentHistory.findMany({
      where: { doctorId, clinicId },
      orderBy: { endedAt: "desc" },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        statusAtEnd: true,
        reason: true,
        clinic: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(rows);
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: e.message || "Failed" }, { status });
  }
}
