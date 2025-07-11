import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/appointments/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

// PUT /api/appointments/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        date: new Date(body.date),
        time: body.time,
        endTime: body.endTime,
        doctorId: body.doctorId,
        department: body.department,
        type: body.type,
        duration: body.duration,
        room: body.room,
        reasonForVisit: body.reasonForVisit,
        notes: body.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
