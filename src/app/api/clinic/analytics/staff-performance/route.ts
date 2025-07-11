import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const clinicId = "demo-clinic-id";

  const doctors = await prisma.doctor.findMany({
    where: { clinicId },
    select: {
      fullName: true,
      specialty: true,
      appointments: true,
    },
  });

  const transformed = doctors.map((doc) => ({
    name: doc.fullName,
    role: doc.specialty || "Doctor",
    patients: doc.appointments.length,
    rating: 4.8, 
  }));

  return NextResponse.json(transformed);
}
