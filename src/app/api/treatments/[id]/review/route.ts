// app/api/treatments/[id]/review/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: hazırkı pasiyentin bu treatment üçün review-i
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (user as any).role as string | undefined;
  if (role !== "patient") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: treatmentId } = await ctx.params;

  const review = await prisma.treatmentReview.findUnique({
    where: {
      treatmentId_patientUserId: {
        treatmentId,
        patientUserId: user.id as string,
      },
    },
  });

  return NextResponse.json({ review });
}

// POST: create/update review
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (user as any).role as string | undefined;
  if (role !== "patient") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: treatmentId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const rating = Number(body.rating ?? 0);
  const comment = (body.comment ?? "").toString().trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  // Bu treatment həqiqətən bu user-ə məxsusdurmu?
  const treatment = await prisma.treatmentEntry.findFirst({
    where: {
      id: treatmentId,
      OR: [
        { patientUserId: user.id as string },
        user.email
          ? {
              patient: {
                email: user.email,
              },
            }
          : undefined,
      ].filter(Boolean) as any,
    },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      patientUser: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, fullName: true, email: true } },
      clinic: { select: { id: true, name: true, email: true } },
    },
  });

  // Join pasiyentdə patient relation NULL ola bilər, o yüzden yalnız treatment yoxlanır
  if (!treatment) {
    return NextResponse.json(
      { error: "Treatment not found or not owned by this patient" },
      { status: 404 }
    );
  }

  const patientId = treatment.patient?.id ?? null;
  const patientName =
    treatment.patient?.name ??
    treatment.patientUser?.name ??
    null;

  // 1) Review upsert – sadə create, yalnız scalar field-lar
  const review = await prisma.treatmentReview.upsert({
    where: {
      treatmentId_patientUserId: {
        treatmentId,
        patientUserId: user.id as string,
      },
    },
    create: {
      treatmentId,
      ...(patientId ? { patientId } : {}), // join pasiyentdə NULL ola bilər
      patientUserId: user.id as string,
      rating,
      comment: comment || null,
    },
    update: {
      rating,
      comment: comment || null,
    },
  });

  // 2) Aggregates – doctor/clinic üçün yenilə (yalnız public review-lar daxil olsun)
  const doctorId = treatment.doctor?.id || null;
  const clinicId = treatment.clinic?.id || null;

  if (doctorId) {
    const agg = await prisma.treatmentReview.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
      where: { isPublic: true, treatment: { doctorId } },
    });
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        ratingAvg: Number(agg._avg.rating ?? 0),
        ratingCount: Number(agg._count._all ?? 0),
      },
    });
  }

  if (clinicId) {
    const agg = await prisma.treatmentReview.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
      where: { isPublic: true, treatment: { clinicId } },
    });
    await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        ratingAvg: Number(agg._avg.rating ?? 0),
        ratingCount: Number(agg._count._all ?? 0),
      },
    });
  }

  // 3) Bildiriş yaz (doctor + clinic)
  await prisma.notification.createMany({
    data: [
      doctorId && {
        type: "REVIEW_CREATED",
        scope: "doctor",
        doctorId,
        treatmentId,
        reviewId: review.id,
        payload: {
          rating,
          comment,
          patientName,
          clinicName: treatment.clinic?.name ?? null,
        },
      },
      clinicId && {
        type: "REVIEW_CREATED",
        scope: "clinic",
        clinicId,
        treatmentId,
        reviewId: review.id,
        payload: {
          rating,
          comment,
          patientName,
          doctorName: treatment.doctor?.fullName ?? null,
        },
      },
    ].filter(Boolean) as any[],
  });

  // 4) Email bildiriş (sakit try/catch)
  try {
    const originHeader = req.headers.get("origin");
    const host = req.headers.get("host");
    const origin =
      originHeader ||
      (host
        ? `https://${host}`
        : process.env.NEXT_PUBLIC_APP_URL || "https://tagiza.com");

    const doctorUrl = doctorId
      ? `${origin}/doctor/${encodeURIComponent(
          treatment.doctor?.fullName || doctorId
        )}`
      : origin;
    const clinicUrl = clinicId
      ? `${origin}/clinic/${encodeURIComponent(
          treatment.clinic?.name || clinicId
        )}`
      : origin;

    const subject = "New patient review submitted";
    const htmlForDoctor = `
      <p>Hello ${treatment.doctor?.fullName || "Doctor"},</p>
      <p>A patient left a new review:</p>
      <p>Rating: <strong>${rating}/5</strong></p>
      ${comment ? `<p>Comment: “${comment}”</p>` : ""}
      <p><a href="${doctorUrl}" target="_blank">Open your public profile</a></p>
    `;
    const htmlForClinic = `
      <p>Hello ${treatment.clinic?.name || "Clinic"},</p>
      <p>A patient left a new review related to your clinic:</p>
      <p>Rating: <strong>${rating}/5</strong></p>
      ${comment ? `<p>Comment: “${comment}”</p>` : ""}
      <p><a href="${clinicUrl}" target="_blank">Open your public profile</a></p>
    `;

    const { sendEmail } = await import("@/app/libs/email");
    if (treatment.doctor?.email) {
      await sendEmail({
        to: treatment.doctor.email,
        subject,
        html: htmlForDoctor,
      });
    }
    if (treatment.clinic?.email) {
      await sendEmail({
        to: treatment.clinic.email,
        subject,
        html: htmlForClinic,
      });
    }
  } catch (e) {
    console.error("Review notification email failed", e);
  }

  return NextResponse.json({ review });
}
