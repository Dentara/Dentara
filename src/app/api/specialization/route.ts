import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const specializations = await prisma.specialization.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(specializations);
  } catch (error) {
    console.error("Failed to load specializations:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Missing specialization name", { status: 400 });
    }

    const exists = await prisma.specialization.findFirst({ where: { name } });
    if (exists) {
      return new NextResponse("Specialization already exists", { status: 409 });
    }

    const newSpecialization = await prisma.specialization.create({
      data: { name },
    });

    return NextResponse.json(newSpecialization);
  } catch (error) {
    console.error("Failed to create specialization:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
