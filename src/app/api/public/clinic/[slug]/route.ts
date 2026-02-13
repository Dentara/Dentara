export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Public Clinic resolver (schema-safe)
 * Qaytarır:
 *  - item (clinic core fields)
 *  - doctors (team)
 *  - clinicRatingAvg / clinicRatingCount / clinicReviews   (ClinicReview əsasında)
 *  - doctorRatingAvg / doctorRatingCount / doctorReviews   (TreatmentReview əsasında, klinika kontekstində)
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const key = decodeURIComponent(slug || "").trim();
  if (!key) return NextResponse.json({ item: null }, { status: 404 });

  // 1) Clinic tap – əvvəlcə yalnız id/name, sonra geniş seçimə cəhd
  let clinicCore: { id: string; name: string } | null = null;
  try {
    clinicCore = await prisma.clinic.findFirst({
      where: { name: { contains: key, mode: "insensitive" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    clinicCore = null;
  }

  // Genişləndirilmiş sahələr (sxemdə olmaya bilər — try/catch)
  let clinicExpanded:
    | (typeof clinicCore & {
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        website?: string | null;
      })
    | null = null;

  if (clinicCore) {
    try {
      clinicExpanded = (await prisma.clinic.findFirst({
        where: { id: clinicCore.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          website: true,
          country: true,
          city: true,
        },
      })) as any;
    } catch {
      clinicExpanded = clinicCore; // yalnız id/name
    }
  }

  // 2) Fallback: User.role="clinic" (id, name, email)
  let clinicUser: { id: string; name: string | null; email: string | null } | null =
    null;
  try {
    clinicUser = await prisma.user.findFirst({
      where: {
        AND: [
          { role: "clinic" as any },
          {
            OR: [
              { name: { contains: key, mode: "insensitive" } },
              { email: { contains: key, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  } catch {
    clinicUser = null;
  }

  if (!clinicExpanded && !clinicUser) {
    return NextResponse.json({ item: null }, { status: 404 });
  }

  // 3) Team (həkimlər)
  let doctors: Array<{ id: string; fullName: string | null }> = [];
  try {
    const nameToMatch = clinicExpanded?.name || clinicUser?.name || key;
    doctors =
      (await prisma.doctor.findMany({
        where: {
          clinic: { name: { contains: nameToMatch || "", mode: "insensitive" } },
        },
        select: { id: true, fullName: true },
        orderBy: { fullName: "asc" },
        take: 50,
      })) || [];
  } catch {
    doctors = [];
  }

  const item = {
    id: clinicExpanded?.id || clinicUser?.id!, // UI üçün saxlayırıq
    name: clinicExpanded?.name || clinicUser?.name || "Clinic",
    email:
      clinicExpanded && "email" in clinicExpanded
        ? clinicExpanded?.email ?? clinicUser?.email ?? null
        : clinicUser?.email ?? null,
    phone:
      clinicExpanded && "phone" in clinicExpanded
        ? (clinicExpanded as any).phone ?? null
        : null,
    address:
      clinicExpanded && "address" in clinicExpanded
        ? (clinicExpanded as any).address ?? null
        : null,
    website:
      clinicExpanded && "website" in clinicExpanded
        ? (clinicExpanded as any).website ?? null
        : null,
    country:
      clinicExpanded && "country" in clinicExpanded
        ? (clinicExpanded as any).country ?? null
        : null,
    city:
      clinicExpanded && "city" in clinicExpanded
        ? (clinicExpanded as any).city ?? null
        : null,
  };

  // ⭐ Review-lar üçün MÜTLƏQ Clinic.id lazımdır
  let clinicIdForReviews: string | null = clinicExpanded?.id ?? null;

  // Yalnız User tapılıbsa → email-dən Clinic.id-ni çıxar
  if (!clinicIdForReviews && clinicUser?.email) {
    try {
      const c = await prisma.clinic.findFirst({
        where: { email: clinicUser.email },
        select: { id: true },
      });
      clinicIdForReviews = c?.id ?? null;
    } catch {}
  }

  // ⭐ ClinicReview (klinikaya verilən rəylər) + TreatmentReview (klinika kontekstində həkimlərə verilən rəylər)
  let clinicRatingAvg = 0;
  let clinicRatingCount = 0;
  let clinicReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }> = [];

  let doctorRatingAvg = 0;
  let doctorRatingCount = 0;
  let doctorReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    doctorName: string | null;
  }> = [];

  try {
    if (clinicIdForReviews) {
      // ClinicReview agg + list
      const aggClinic = await prisma.clinicReview.aggregate({
        _avg: { rating: true },
        _count: { _all: true },
        where: { clinicId: clinicIdForReviews, isPublic: true },
      });
      clinicRatingAvg = Number(aggClinic._avg.rating ?? 0);
      clinicRatingCount = Number(aggClinic._count._all ?? 0);

      const listClinic = await prisma.clinicReview.findMany({
        where: { clinicId: clinicIdForReviews, isPublic: true },
        select: { id: true, rating: true, comment: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      clinicReviews = listClinic.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? null,
        createdAt: r.createdAt.toISOString(),
      }));

      // Doctor TreatmentReview agg + list (klinika kontekstində)
      const aggDoc = await prisma.treatmentReview.aggregate({
        _avg: { rating: true },
        _count: { _all: true },
        where: { isPublic: true, treatment: { clinicId: clinicIdForReviews } },
      });
      doctorRatingAvg = Number(aggDoc._avg.rating ?? 0);
      doctorRatingCount = Number(aggDoc._count._all ?? 0);

      const listDoc = await prisma.treatmentReview.findMany({
        where: { isPublic: true, treatment: { clinicId: clinicIdForReviews } },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          treatment: { select: { doctor: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      doctorReviews = listDoc.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? null,
        createdAt: r.createdAt.toISOString(),
        doctorName: r.treatment?.doctor?.fullName ?? null,
      }));
    }
  } catch {}

  return NextResponse.json({
    item,
    doctors,
    clinicRatingAvg,
    clinicRatingCount,
    clinicReviews,
    doctorRatingAvg,
    doctorRatingCount,
    doctorReviews,
  });
}
