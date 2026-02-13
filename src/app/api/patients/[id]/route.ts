// app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ===================== GET /api/patients/[id] =====================
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    // 1) Normal Patient.id kimi axtarırıq
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: true,
        prescriptions: true,
        billing: true,
      },
    });

    if (patient) {
      return NextResponse.json(patient, { status: 200 });
    }

    // 2) Patient tapılmadı → bəlkə bu ClinicPatient.id-dir
    const membership = await prisma.clinicPatient.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        image: true,
        gender: true,
        birthDate: true,
        status: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // PatientDetail strukturuna uyğun “synthetic” patient obyekt qururuq
    const mapped: any = {
      id: membership.id,
      name: membership.fullName,
      email: membership.email,
      phone: membership.phone ?? null,
      address: null,
      city: null,
      state: null,
      zip: null,
      emergencyContact: null,
      gender: membership.gender ?? null,
      dob:
        membership.birthDate instanceof Date
          ? membership.birthDate.toISOString()
          : membership.birthDate
          ? String(membership.birthDate)
          : null,
      image: membership.image ?? null,

      toothPref: null,
      dentalNotes: null,
      bloodType: null,
      height: null,
      weight: null,
      allergies: [],
      chronicConditions: null,
      currentMedications: null,
      smokingStatus: null,

      insuranceProvider: null,
      policyNumber: null,
      groupNumber: null,
      policyHolder: null,
      insuranceNotes: null,
      billingPreference: null,

      status: membership.status ?? "Active",

      // Klinik dashboard üçün lazımdır ki, səhifə partlamasın
      appointments: [],
      prescriptions: [],
      billing: [],
    };

    return NextResponse.json(mapped, { status: 200 });
  } catch (error) {
    console.error("[PATIENT_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ==================== PATCH /api/patients/[id] ====================
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const normDob =
      typeof body.dob === "string"
        ? body.dob.length === 10
          ? new Date(body.dob + "T00:00:00.000Z")
          : new Date(body.dob)
        : body.dob
        ? new Date(body.dob)
        : undefined;

    const toList = (v: any) => {
      if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
      if (typeof v === "string") {
        return v
          .split(/[,;\n]/g)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return undefined;
    };

    const fullName =
      typeof body.name === "string" && body.name.trim().length > 0
        ? body.name.trim()
        : [body.firstName, body.lastName]
            .filter(
              (s: any) => typeof s === "string" && s.trim().length > 0
            )
            .join(" ")
            .trim() || undefined;

    const data: any = {
      // basic info
      name: fullName,
      email: body.email ?? undefined,
      phone: body.phone ?? undefined,
      address: body.address ?? undefined,
      city: body.city ?? undefined,
      state: body.state ?? undefined,
      zip: body.zip ?? undefined,
      emergencyContact: body.emergencyContact ?? undefined,
      gender: body.gender ?? undefined,
      dob: normDob ?? undefined,
      image: body.image ?? undefined,

      // medical info
      toothPref: body.toothPref ?? undefined,
      dentalNotes: body.dentalNotes ?? undefined,
      bloodType: body.bloodType ?? undefined,
      height:
        body.height !== undefined ? Number(body.height) : undefined,
      weight:
        body.weight !== undefined ? Number(body.weight) : undefined,
      allergies: toList(body.allergies)
        ? { set: toList(body.allergies)! }
        : undefined,
      chronicConditions: body.chronicConditions ?? undefined,
      currentMedications: body.currentMedications ?? undefined,
      smokingStatus: body.smokingStatus ?? undefined,

      // insurance & billing
      insuranceProvider: body.insuranceProvider ?? undefined,
      policyNumber: body.policyNumber ?? undefined,
      groupNumber: body.groupNumber ?? undefined,
      policyHolder: body.policyHolder ?? undefined,
      insuranceNotes: body.insuranceNotes ?? undefined,
      billingPreference: body.billingPreference ?? undefined,

      // optional status toggle
      status: body.status ?? undefined,
    };

    const updated = await prisma.patient.update({
      where: { id },
      data,
      include: {
        appointments: true,
        prescriptions: true,
        billing: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PATIENT_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
