// app/api/clinic/reviews/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/clinic/reviews?take=100
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const clinicUserId =
    role === "clinic" ? ((session?.user as any)?.id as string) : undefined;
  if (!clinicUserId)
    return NextResponse.json({ clinicReviews: [], doctorReviews: [] });

  // clinicUserId → Clinic.id tapırıq (e-mail ilə)
  const clinicUser = await prisma.user.findUnique({
    where: { id: clinicUserId },
    select: { email: true },
  });
  const clinic = clinicUser?.email
    ? await prisma.clinic.findFirst({
        where: { email: clinicUser.email },
        select: { id: true, name: true },
      })
    : null;
  const clinicId = clinic?.id;
  if (!clinicId)
    return NextResponse.json({ clinicReviews: [], doctorReviews: [] });

  const { searchParams } = new URL(req.url);
  const take = Math.min(parseInt(searchParams.get("take") || "50", 10), 200);

  // ===== ClinicReview (müstəqil sistem) =====
  const clinicReviewsRaw = await prisma.clinicReview.findMany({
    where: { clinicId, isPublic: true },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      patientUserId: true,
      clinic: { select: { id: true, name: true } },
    },
  });

  // User + Patient enrichment (adı, e-poçtu və profil linki)
  const clinicReviews = await Promise.all(
    clinicReviewsRaw.map(async (r) => {
      const user =
        r.patientUserId &&
        (await prisma.user.findUnique({
          where: { id: r.patientUserId },
          select: { id: true, name: true, email: true },
        }));

      // Patient tap: əvvəl e-poçtla, alınmasa id bərabərliyi
      let patient:
        | { id: string; name: string | null; email: string | null }
        | null = null;

      if (user?.email) {
        patient = await prisma.patient.findFirst({
          where: { email: user.email },
          select: { id: true, name: true, email: true },
        });
      }
      if (!patient && user?.id) {
        patient = await prisma.patient.findUnique({
          where: { id: user.id },
          select: { id: true, name: true, email: true },
        });
      }

      // Klinik kontekstdə patient profilinə keçid
      const patientHref = patient?.id
        ? `/dashboard/clinic/patients?query=${encodeURIComponent(patient.id)}`
        : user?.email
        ? `/dashboard/clinic/patients?query=${encodeURIComponent(
            user.email
          )}`
        : null;

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        clinic: r.clinic,
        patient: {
          id: patient?.id || null,
          name: patient?.name || user?.name || null,
          email: patient?.email || user?.email || null,
          href: patientHref,
        },
      };
    })
  );

  // ===== Doctor (TreatmentReview → həmin klinikanın həkimlərinə aid) =====
  const doctorReviewsRaw = await prisma.treatmentReview.findMany({
    where: { isPublic: true, treatment: { clinicId } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      patientUserId: true,
      treatment: {
        select: {
          doctor: { select: { id: true, fullName: true } },
          clinic: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const doctorReviews = await Promise.all(
    doctorReviewsRaw.map(async (r) => {
      const t = r.treatment;
      const pt = t?.patient || null;

      // patientUserId → User
      const user =
        r.patientUserId &&
        (await prisma.user.findUnique({
          where: { id: r.patientUserId },
          select: { id: true, name: true, email: true },
        }));

      const patientId = pt?.id || null;
      const patientName = pt?.name || user?.name || null;
      const patientEmail = pt?.email || user?.email || null;

      const patientHref = patientId
        ? `/dashboard/clinic/patients?query=${encodeURIComponent(patientId)}`
        : patientEmail
        ? `/dashboard/clinic/patients?query=${encodeURIComponent(
            patientEmail
          )}`
        : null;

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        doctor: t?.doctor || null,
        clinic: t?.clinic || null,
        patient:
          patientName || patientEmail
            ? {
                id: patientId,
                name: patientName,
                email: patientEmail,
                href: patientHref,
              }
            : null,
      };
    })
  );

  return NextResponse.json({
    clinicReviews,
    doctorReviews,
  });
}
