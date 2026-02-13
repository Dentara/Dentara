// app/api/treatments/[id]/attachments/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: { id: string; fileId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (role !== "clinic" && role !== "doctor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.treatmentAttachment.deleteMany({
    where: { entryId: params.id, patientFileId: params.fileId },
  });

  return NextResponse.json({ ok: true });
}
