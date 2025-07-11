import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET doctor by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      include: {
        appointments: true,
        specialization: true,
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch doctor" }, { status: 500 });
  }
}

// PUT update doctor
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updatedDoctor = await prisma.doctor.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update doctor" }, { status: 500 });
  }
}

// DELETE doctor
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.doctor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete doctor" }, { status: 500 });
  }
}
