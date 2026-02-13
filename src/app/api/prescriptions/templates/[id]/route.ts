import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const template = await prisma.prescriptionTemplate.findUnique({
    where: { id }
  });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const updated = await prisma.prescriptionTemplate.update({
    where: { id },
    data: {
      name: body.name,
      medications: body.medications,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.prescriptionTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
