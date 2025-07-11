import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Schema (edit səhifəsindən götürülüb)
const appointmentSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  endTime: z.string().min(1),
  doctorId: z.string().min(1),
  department: z.string().min(1),
  type: z.string().min(1),
  duration: z.string().min(1),
  room: z.string().min(1),
  reasonForVisit: z.string().min(1),
  notes: z.string().optional(),
});

// GET – gətir appointment məlumatı
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { name: true } },
        doctor: { select: { name: true, department: true, id: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}

// PATCH – redaktə et appointment
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.format() }, { status: 400 });
  }

  try {
    const updated = await db.appointment.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Update failed", error }, { status: 500 });
  }
}
