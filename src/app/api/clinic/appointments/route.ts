import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/appointments
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const clinicId = url.searchParams.get("clinicId");
  const doctorId = url.searchParams.get("doctorId");
  const patientId = url.searchParams.get("patientId");

  if (!clinicId && !doctorId && !patientId) {
    return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        ...(clinicId && { clinicId }),
        ...(doctorId && { doctorId }),
        ...(patientId && { patientId }),
      },
      include: {
        doctor: true,
        patient: true,
        clinic: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      clinicId,
      doctorId,
      patientId,
      patientName,
      type,
      date,
      startTime,
      endTime,
      duration,
      reason,
      status,
      notes,
    } = body;

    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        doctorId,
        patientId,
        patientName,
        type,
        date: new Date(date),
        startTime,
        endTime,
        duration,
        reasonForVisit: reason,
        status,
        notes,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
