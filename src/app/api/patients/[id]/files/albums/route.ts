// app/api/patients/[id]/files/albums/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// Patient.id və ya ClinicPatient.id -> patientUserId resolver
async function resolvePatientUserIdByAnyKey(patientOrMembershipId: string) {
  // 1) Patient.id kimi cəhd et
  const patient = await prisma.patient.findUnique({
    where: { id: patientOrMembershipId },
    select: { id: true, email: true },
  });
  if (patient) {
    if (patient.email) {
      const u = await prisma.user.findUnique({
        where: { email: patient.email },
        select: { id: true },
      });
      if (u) return u.id;
    }
    const u2 = await prisma.user.findUnique({
      where: { id: patient.id },
      select: { id: true },
    });
    return u2?.id ?? null;
  }

  // 2) ClinicPatient.id
  const cp = await prisma.clinicPatient.findUnique({
    where: { id: patientOrMembershipId },
    select: {
      patientUserId: true,
      email: true,
      patientGlobalId: true,
    },
  });
  if (!cp) return null;

  if (cp.patientUserId) return cp.patientUserId;

  if (cp.email) {
    const u = await prisma.user.findUnique({
      where: { email: cp.email },
      select: { id: true },
    });
    if (u) return u.id;
  }

  if (cp.patientGlobalId) {
    const p2 = await prisma.patient.findUnique({
      where: { id: cp.patientGlobalId },
      select: { id: true, email: true },
    });
    if (p2) {
      if (p2.email) {
        const u = await prisma.user.findUnique({
          where: { email: p2.email },
          select: { id: true },
        });
        if (u) return u.id;
      }
      const u2 = await prisma.user.findUnique({
        where: { id: p2.id },
        select: { id: true },
      });
      if (u2) return u2.id;
    }
  }

  return null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return new NextResponse("Forbidden", { status: 403 });

  const { id: patientId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  const albums = await prisma.patientAlbum.findMany({
    where: { patientUserId },
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json({ albums });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return new NextResponse("Forbidden", { status: 403 });

  const { id: patientId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  const body = await req.json().catch(() => ({}));
  const title = (body?.title || "").trim();
  const scope = (body?.scope || "xrays").trim();
  if (!title)
    return new NextResponse("Missing title", { status: 400 });

  const created = await prisma.patientAlbum.create({
    data: { patientUserId, title, scope },
  });
  return NextResponse.json({ album: created });
}
