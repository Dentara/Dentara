import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/doctor/reviews?take=100
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const doctorUserId = role === "doctor" ? ((session?.user as any)?.id as string) : undefined;
  if (!doctorUserId) return NextResponse.json({ items: [] });

  // doctorUserId → Doctor.id (e-mail ilə)
  const doctorUser = await prisma.user.findUnique({ where: { id: doctorUserId }, select: { email: true } });
  const doctor = doctorUser?.email
    ? await prisma.doctor.findFirst({ where: { email: doctorUser.email }, select: { id: true } })
    : null;
  const doctorId = doctor?.id;
  if (!doctorId) return NextResponse.json({ items: [] });

  const { searchParams } = new URL(req.url);
  const take = Math.min(parseInt(searchParams.get("take") || "50", 10), 200);

  const list = await prisma.treatmentReview.findMany({
    where: { isPublic: true, treatment: { doctorId } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true, rating: true, comment: true, createdAt: true,
      treatment: {
        select: {
          clinic: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({
    items: list.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      clinic: r.treatment?.clinic || null,
      patient: r.treatment?.patient || null,
    })),
  });
}
