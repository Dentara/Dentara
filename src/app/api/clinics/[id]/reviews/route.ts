import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET: public clinic reviews (paged)
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: clinicId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") || 10), 50);
  const skip = Math.max(Number(searchParams.get("skip") || 0), 0);

  const [list, agg] = await Promise.all([
    prisma.clinicReview.findMany({
      where: { clinicId, isPublic: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, rating: true, comment: true, createdAt: true },
      take, skip,
    }),
    prisma.clinicReview.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
      where: { clinicId, isPublic: true },
    }),
  ]);

  return NextResponse.json({
    items: list.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
    ratingAvg: Number(agg._avg.rating ?? 0),
    ratingCount: Number(agg._count._all ?? 0),
  });
}

// POST: patient upsert
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: clinicId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const rating = Number(body.rating ?? 0);
  const comment = (body.comment ?? "").toString().trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  // upsert
  const review = await prisma.clinicReview.upsert({
    where: { clinicId_patientUserId: { clinicId, patientUserId: session.user.id as string } },
    create: { clinicId, patientUserId: session.user.id as string, rating, comment: comment || null },
    update: { rating, comment: comment || null },
  });

  // aggregate -> Clinic.ratingAvg/Count (yalnız clinic-review-lardan)
  const agg = await prisma.clinicReview.aggregate({
    _avg: { rating: true },
    _count: { _all: true },
    where: { clinicId, isPublic: true },
  });
  await prisma.clinic.update({
    where: { id: clinicId },
    data: { ratingAvg: Number(agg._avg.rating ?? 0), ratingCount: Number(agg._count._all ?? 0) },
  });

  // notification + email (yalnız clinic üçün)
  await prisma.notification.create({
    data: {
      type: "CLINIC_REVIEW_CREATED",
      scope: "clinic",
      clinicId,
      reviewId: review.id,
      payload: { rating, comment },
    },
  });

  try {
    const { sendEmail } = await import("@/app/libs/email");
    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { name: true, email: true } });
    if (clinic?.email) {
      await sendEmail({
        to: clinic.email,
        subject: "New clinic review submitted",
        html: `<p>Hello ${clinic.name || "Clinic"},</p><p>Rating: <b>${rating}/5</b></p>${comment ? `<p>“${comment}”</p>` : ""}`,
      });
    }
  } catch {}

  return NextResponse.json({ review });
}
