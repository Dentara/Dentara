import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // Prescription-ların listini qaytarır
  const prescriptions = await prisma.prescription.findMany({
    orderBy: { date: "desc" },
    include: { patient: true, doctor: true },
  });
  return NextResponse.json(prescriptions);
}

export async function POST(req: NextRequest) {
  // Yeni prescription yaradır
  const body = await req.json();
  const newPrescription = await prisma.prescription.create({
    data: {
      patientId: body.patientId,
      doctorId: body.doctorId,
      date: body.date,
      diagnosis: body.diagnosis,
      notes: body.notes,
      medications: body.medications, // JSONB tipində saxla
    },
  });
  return NextResponse.json(newPrescription);
}
