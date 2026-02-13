// app/api/treatments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["clinic", "doctor", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const row = await prisma.treatmentEntry.findUnique({
    where: { id: params.id },
    include: {
      clinic: { select: { id: true, name: true } },
      doctor: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
        },
      },
      patient: { select: { id: true, name: true, email: true } },
      patientUser: { select: { id: true, name: true, email: true } },
      teeth: {
        select: {
          id: true,
          numberFDI: true,
          arch: true,
          quadrant: true,
          stateAfter: true,
        },
      },
      attachments: {
        include: {
          patientFile: {
            select: { id: true, title: true, path: true, thumbnail: true },
          },
        },
      },
      implants: true,
    },
  });

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let patient: any = row.patient
    ? { ...row.patient }
    : row.patientUser
    ? {
        id: row.patientUser.id,
        name: row.patientUser.name ?? "",
        email: row.patientUser.email ?? null,
      }
    : null;

  if ((!patient || !patient.email) && row.clinicId && row.patientUserId) {
    try {
      const cp = await prisma.clinicPatient.findFirst({
        where: {
          clinicId: row.clinicId,
          patientUserId: row.patientUserId,
        },
        select: { email: true },
      });
      if (cp?.email) {
        if (!patient) {
          patient = {
            id: row.patientUserId,
            name: row.patientUser?.name ?? "",
            email: cp.email,
          };
        } else {
          patient.email = cp.email;
        }
      }
    } catch {}
  }

  const item: any = {
    ...row,
    patient,
  };

  return NextResponse.json({ item });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["clinic", "doctor", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const replaceTeeth = Array.isArray(body.teeth);

  const updated = await prisma.$transaction(async (tx) => {
    if (replaceTeeth) {
      await tx.treatmentTooth.deleteMany({ where: { entryId: params.id } });
    }

    const u = await tx.treatmentEntry.update({
      where: { id: params.id },
      data: {
        ...(body.date ? { date: new Date(body.date) } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.category ? { category: body.category } : {}),
        ...(body.procedureCode ? { procedureCode: body.procedureCode } : {}),
        ...(body.procedureName ? { procedureName: body.procedureName } : {}),
        notes: body.notes === undefined ? undefined : body.notes,
        price:
          body.price === undefined
            ? undefined
            : body.price === null
            ? null
            : new prisma.Prisma.Decimal(Number(body.price)),
        surfaces: Array.isArray(body.surfaces) ? body.surfaces : undefined,
        ...(replaceTeeth
          ? {
              teeth: {
                create: body.teeth.map((t: any) => ({
                  numberFDI: t.numberFDI,
                  arch:
                    t.arch ??
                    (t.numberFDI >= 11 && t.numberFDI <= 28
                      ? "upper"
                      : "lower"),
                  quadrant:
                    t.quadrant ??
                    (t.numberFDI >= 11 && t.numberFDI <= 18
                      ? 1
                      : t.numberFDI >= 21 && t.numberFDI <= 28
                      ? 2
                      : t.numberFDI >= 31 && t.numberFDI <= 38
                      ? 3
                      : 4),
                })),
              },
            }
          : {}),
      },
      include: {
        clinic: { select: { id: true, name: true } },
        doctor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        patient: { select: { id: true, name: true, email: true } },
        patientUser: { select: { id: true, name: true, email: true } },
        teeth: true,
        attachments: {
          include: {
            patientFile: {
              select: { id: true, title: true, path: true, thumbnail: true },
            },
          },
        },
      },
    });

    let patient: any = updated.patient
      ? { ...updated.patient }
      : updated.patientUser
      ? {
          id: updated.patientUser.id,
          name: updated.patientUser.name ?? "",
          email: updated.patientUser.email ?? null,
        }
      : null;

    if (
      (!patient || !patient.email) &&
      updated.clinicId &&
      updated.patientUserId
    ) {
      try {
        const cp = await tx.clinicPatient.findFirst({
          where: {
            clinicId: updated.clinicId!,
            patientUserId: updated.patientUserId,
          },
          select: { email: true },
        });
        if (cp?.email) {
          if (!patient) {
            patient = {
              id: updated.patientUserId,
              name: updated.patientUser?.name ?? "",
              email: cp.email,
            };
          } else {
            patient.email = cp.email;
          }
        }
      } catch {}
    }

    return {
      ...updated,
      patient,
    } as any;
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["clinic", "doctor", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.treatmentEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
