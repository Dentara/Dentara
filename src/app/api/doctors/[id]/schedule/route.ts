// File: src/app/api/doctors/[id]/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/doctors/[id]/schedule
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { doctorId: params.id },
    });

    if (!schedule) {
      return new NextResponse("Schedule not found", { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("GET doctor schedule error:", error);
    return new NextResponse("Failed to fetch schedule", { status: 500 });
  }
}

// PATCH: /api/doctors/[id]/schedule
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updatedSchedule = await prisma.schedule.upsert({
      where: { doctorId: params.id },
      update: { ...body },
      create: {
        doctorId: params.id,
        ...body,
      },
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("PATCH doctor schedule error:", error);
    return new NextResponse("Failed to update schedule", { status: 500 });
  }
}