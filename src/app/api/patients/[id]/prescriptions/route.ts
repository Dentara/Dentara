import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET prescriptions by patient ID
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 

  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: params.id },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

// ✅ POST new prescription for a patient
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const newPrescription = await prisma.prescription.create({
      data: {
        patientId: params.id,
        medication: body.medication,
        dosage: body.dosage,
        frequency: body.frequency,
        duration: body.duration,
        doctor: body.doctor,
        status: body.status,
        refills: body.refills,
        date: new Date(body.date),
      },
    });

    return NextResponse.json(newPrescription, { status: 201 });
  } catch (error) {
    console.error("POST /api/patient/[id]/prescriptions error:", error);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}
