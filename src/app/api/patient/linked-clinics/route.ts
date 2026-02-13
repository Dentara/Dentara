import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/patient/linked-clinics?patientUserId=... | patientEmail=...
 * QAYTARIR: [{ id, name }]
 *
 * Stabil strategiya (schema-safe):
 *  - ClinicPatient: yalnız patientUserId və email ilə axtarırıq (patientId-a toxunmuruq)
 *  - Appointment fallback: patient.email ilə bağlı appointment-lardan clinic çıxarırıq
 *  - Patient modelindən heç bir əlavə sahə seçmirik (clinicId/clinic relation tələb etmirik)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientUserId = searchParams.get("patientUserId") || undefined;
    const patientEmail = searchParams.get("patientEmail") || undefined;

    if (!patientUserId && !patientEmail) {
      return NextResponse.json(
        { error: "patientUserId or patientEmail required" },
        { status: 400 },
      );
    }

    const map = new Map<string, string>();

    // 1) ClinicPatient (yalnız patientUserId və/və ya email) — STATUS filter YOX
    const clinicPatients = await prisma.clinicPatient.findMany({
      where: {
        OR: [
          patientUserId ? { patientUserId } : undefined,
          patientEmail ? { email: patientEmail } : undefined,
        ].filter(Boolean) as any,
      },
      select: {
        clinicId: true,
        clinic: { select: { id: true, name: true } },
      },
    });

    for (const cp of clinicPatients) {
      if (cp.clinic?.id) map.set(cp.clinic.id, cp.clinic.name ?? "Clinic");
      else if (cp.clinicId) map.set(cp.clinicId, "Clinic");
    }

    // 2) Appointment fallback (yalnız patient.email ilə)
    if (patientEmail) {
      const apptClinics = await prisma.appointment.findMany({
        where: { patient: { email: patientEmail } },
        select: { clinic: { select: { id: true, name: true } } },
        take: 100,
      });
      for (const a of apptClinics) {
        const c = a.clinic;
        if (c?.id) map.set(c.id, c.name ?? "Clinic");
      }
    }

    const list = Array.from(map, ([id, name]) => ({ id, name }));
    return NextResponse.json(list);
  } catch (e) {
    console.error("[GET /api/patient/linked-clinics] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
