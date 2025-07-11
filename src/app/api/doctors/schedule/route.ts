import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/doctors/schedule
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Failed to fetch doctor schedules:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
