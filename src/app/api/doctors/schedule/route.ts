// app/api/doctors/schedule/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/doctors/schedule?doctorId=xxx&start=2024-07-10&end=2024-07-17
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let where: any = {};
  if (doctorId) where.doctorId = doctorId;
  if (start && end) where.date = { gte: start, lte: end };

  const schedule = await prisma.appointment.findMany({
    where,
    select: {
      id: true,
      date: true,
      time: true,
      type: true,
      status: true,
      patientName: true,
      doctorId: true,
      doctor: {
        select: { fullName: true, profilePhoto: true }
      }
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(schedule);
}
