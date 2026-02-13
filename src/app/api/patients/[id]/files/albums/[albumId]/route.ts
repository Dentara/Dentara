// app/api/patients/[id]/files/albums/[albumId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

async function resolvePatientUserIdByAnyKey(patientOrMembershipId: string) {
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

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; albumId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return new NextResponse("Forbidden", { status: 403 });

  const { id: patientId, albumId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  const body = await req.json().catch(() => ({}));
  const title = (body?.title || "").trim();
  if (!title)
    return new NextResponse("Missing title", { status: 400 });

  const album = await prisma.patientAlbum.findFirst({
    where: { id: albumId, patientUserId },
    select: { id: true },
  });
  if (!album) return new NextResponse("Not found", { status: 404 });

  const updated = await prisma.patientAlbum.update({
    where: { id: albumId },
    data: { title },
  });
  return NextResponse.json({ album: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; albumId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return new NextResponse("Forbidden", { status: 403 });

  const { id: patientId, albumId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  await prisma.patientFile.updateMany({
    where: { patientUserId, albumId },
    data: { albumId: null },
  });
  await prisma.patientAlbum.delete({ where: { id: albumId } });

  return NextResponse.json({ ok: true });
}
