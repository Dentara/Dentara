// app/api/treatments/[id]/attachments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (role !== "clinic" && role !== "doctor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { patientFileId } = (await req.json()) as { patientFileId?: string };
  if (!patientFileId) return NextResponse.json({ error: "patientFileId required" }, { status: 400 });

  // Əlavə ownership/consent yoxlamaları burada edilə bilər.

  const linked = await prisma.treatmentAttachment.create({
    data: { entryId: params.id, patientFileId },
    include: {
      patientFile: { select: { id: true, title: true, path: true, thumbnail: true } },
    },
  });

  return NextResponse.json({ item: linked }, { status: 201 });
}
