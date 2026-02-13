import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Template-lərin listi
export async function GET() {
  const templates = await prisma.prescriptionTemplate.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(templates);
}

// Yeni template yaratmaq
export async function POST(req: NextRequest) {
  const body = await req.json();
  const template = await prisma.prescriptionTemplate.create({
    data: {
      name: body.name,
      medications: body.medications,
    },
  });
  return NextResponse.json(template);
}
