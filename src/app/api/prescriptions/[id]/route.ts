import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: { patient: true, doctor: true },
  });
  if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(prescription);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const updated = await prisma.prescription.update({
    where: { id },
    data: {
      date: body.date,
      diagnosis: body.diagnosis,
      notes: body.notes,
      medications: body.medications,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.prescription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
