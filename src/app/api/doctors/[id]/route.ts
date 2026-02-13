import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/* ----------------- helpers ----------------- */
async function requireClinicId() {
  const session = await getServerSession(authOptions);
  const user: any = session?.user;
  if (!user?.id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
  if (!clinicId) throw Object.assign(new Error("No clinicId bound"), { status: 403 });
  return { clinicId, user };
}

/* ============ GET /api/doctors/:id ============ */
/** Profil səhifəsinin data formatı ilə uyğun (specialization = primary||secondary). */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { clinicId } = await requireClinicId();
    const { id } = await ctx.params;

    const row = await prisma.doctor.findFirst({
      where: { id, clinicId },
      select: {
        id: true,
        clinicId: true,
        fullName: true,
        email: true,
        phone: true,
        profilePhoto: true,
        primarySpecialization: true,
        secondarySpecialization: true,
        department: true,
        status: true,
        experience: true,          // string saxlanır
        address: true,
        gender: true,
        birthDate: true,
        passportNumber: true,
        bio: true,
        qualifications: true,
        certificates: true,
        diplomaFile: true,
        diplomaAdditions: true,
        workplaces: true,
        createdAt: true,
      },
    });

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const doctor = {
      id: row.id,
      clinicId: row.clinicId,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      profilePhoto: row.profilePhoto,
      specialization: row.primarySpecialization || row.secondarySpecialization || null,
      department: row.department,
      status: row.status || "Active",
      experience: row.experience ?? null,
      address: row.address,
      gender: row.gender,
      birthDate: row.birthDate,
      passportNumber: row.passportNumber,
      bio: row.bio,
      qualifications: row.qualifications,
      certificates: row.certificates,
      diplomaFile: row.diplomaFile,
      diplomaAdditions: row.diplomaAdditions,
      workplaces: row.workplaces,
      createdAt: row.createdAt,
    };

    return NextResponse.json(doctor);
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: e.message || "Failed" }, { status });
  }
}

/* ============ PUT /api/doctors/:id (tam redaktə) ============ */
/** Edit səhifəsindən gələn məlumatları yeniləyir. */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { clinicId } = await requireClinicId();
    const { id } = await ctx.params;

    const own = await prisma.doctor.findFirst({ where: { id, clinicId }, select: { id: true } });
    if (!own) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    const updated = await prisma.doctor.update({
      where: { id },
      data: {
        fullName: body.fullName,
        primarySpecialization: body.specialization ?? undefined, // UI tək dəyər göndərir
        status: body.status,
        experience: typeof body.experience !== "undefined" ? String(body.experience) : undefined,
        email: body.email,
        phone: body.phone,
        bio: body.bio,
        department: body.department,
        address: body.address,
        // languages modeldə yoxdursa toxunmuruq
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: "Failed to update doctor" }, { status });
  }
}

/* ============ PATCH /api/doctors/:id (Deactivate/Activate) ============ */
/** Active→Inactive keçiddə EmploymentHistory-ə SNAPSHOT yazır (doctorName, clinicName). */
type PatchBody = {
  status?: "Active" | "Inactive" | "On Leave";
  specialization?: string;
  email?: string;
  phone?: string;
  certificates?: Array<{ title: string; fileUrl: string }>;
  workplaces?: any;
  profilePhoto?: string | null;
  licenseFile?: string | null;
  reason?: string | null; // arxiv səbəbi (opsional)
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { clinicId } = await requireClinicId();
    const { id } = await ctx.params;

    const current = await prisma.doctor.findFirst({
      where: { id, clinicId },
      select: { id: true, status: true, createdAt: true, fullName: true },
    });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = (await req.json()) as PatchBody;

    const data: Record<string, any> = {};
    if (typeof body.status !== "undefined") data.status = body.status;
    if (typeof body.specialization !== "undefined") data.primarySpecialization = body.specialization;
    if (typeof body.email !== "undefined") data.email = body.email;
    if (typeof body.phone !== "undefined") data.phone = body.phone;
    if (typeof body.certificates !== "undefined") data.certificates = body.certificates;
    if (typeof body.workplaces !== "undefined") data.workplaces = body.workplaces;
    if (typeof body.profilePhoto !== "undefined") data.profilePhoto = body.profilePhoto;
    if (typeof body.licenseFile !== "undefined") data.licenseFile = body.licenseFile;

    const updated = await prisma.doctor.update({
      where: { id },
      data,
      select: { id: true, status: true },
    });

    // ACTIVE → INACTIVE keçidi → snapshotlı arxiv
    if (current.status !== "Inactive" && body.status === "Inactive") {
      const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
        select: { name: true },
      });

      await prisma.doctorEmploymentHistory.create({
        data: {
          doctorId: id,           // relation var; sonradan silinsə SetNull olacaq (schema-da)
          clinicId,
          doctorName: current.fullName ?? "Unknown Doctor", // snapshot
          clinicName: clinic?.name ?? "Unknown Clinic",     // snapshot
          startedAt: current.createdAt,
          endedAt: new Date(),
          statusAtEnd: "Inactive",
          reason: body.reason ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: "Failed to update doctor" }, { status });
  }
}

/* ============ DELETE /api/doctors/:id ============ */
/** Yalnız Inactive olanda silinir; tarixçə saxlanılır (SetNull). */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { clinicId } = await requireClinicId();
    const { id } = await ctx.params;

    const row = await prisma.doctor.findFirst({
      where: { id, clinicId },
      select: { id: true, status: true },
    });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (row.status !== "Inactive") {
      return NextResponse.json({ error: "Only inactive doctors can be deleted." }, { status: 409 });
    }

    // Arxivə toxunmuruq (schema-da onDelete: SetNull olduğuna görə FK pozulmayacaq)
    await prisma.doctor.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: "Failed to delete doctor" }, { status });
  }
}
