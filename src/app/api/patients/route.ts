import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        status: true,
        lastVisit: true,
        condition: true,
        doctor: true,
        image: true,
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("⛔ Error fetching patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}
