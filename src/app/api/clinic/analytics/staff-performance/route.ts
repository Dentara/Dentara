import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user: any = session?.user;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
  if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

  const doctors = await prisma.doctor.findMany({
    where: { clinicId },
    select: {
      fullName: true,
      specialization: true,               // <- düzəldildi
      appointments: { select: { id: true } },
    },
  });

  const transformed = doctors.map((doc) => ({
    name: doc.fullName,
    role: doc.specialization || "Doctor", // <- düzəldildi
    patients: doc.appointments.length,
    rating: 4.8,
  }));

  return NextResponse.json(transformed);
}
