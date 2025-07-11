import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const clinicId = "demo-clinic-id";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      date: { gte: today },
    },
    orderBy: { date: "asc" },
    take: 10,
    include: {
      patient: true,
    },
  });

  const transformed = appointments.map((appt) => ({
    id: appt.id,
    patient: {
      name: appt.patient?.fullName || "Unknown",
      image: appt.patient?.image || "",
    },
    status: appt.status,
    time: appt.time,
    date: "Today", // Daha sonra dinamik yazıla bilər
    doctor: "—",
    type: appt.reason || "General",
  }));

  return NextResponse.json(transformed);
}
