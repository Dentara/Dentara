// app/api/patients/[id]/avatar/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

// Patient.id -> User.id (patientUserId) resolver (email üzərindən)
async function resolvePatientUserIdByEmail(patientId: string) {
  const p = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, email: true },
  });
  if (!p) return null;
  if (p.email) {
    const u = await prisma.user.findUnique({
      where: { email: p.email },
      select: { id: true },
    });
    if (u?.id) return u.id;
  }
  const u2 = await prisma.user.findUnique({
    where: { id: p.id },
    select: { id: true },
  });
  return u2?.id ?? null;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: patientId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByEmail(patientId);
  if (!patientUserId) {
    return NextResponse.json({ error: "Patient user not found" }, { status: 404 });
  }

  // İcazə qaydası:
  // - clinic və ya doctor → həmişə icazə
  // - patient → yalnız özü olduqda (patientUserId === session.user.id)
  const role = String(user.role || "");
  const isClinicOrDoctor = role === "clinic" || role === "doctor";
  const isSelfPatient = role === "patient" && patientUserId === user.id;
  if (!isClinicOrDoctor && !isSelfPatient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file"' }, { status: 400 });
  }
  if (!file.type?.startsWith?.("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  // Saxlama: /public/uploads/avatars/{patientUserId}/<safeName>
  const folderRel = path.join("uploads", "avatars", patientUserId);
  const folderAbs = path.join(process.cwd(), "public", folderRel);
  await fs.mkdir(folderAbs, { recursive: true });

  const safeName =
    `${Date.now()}_${Math.random().toString(36).slice(2)}_` +
    String(file.name || "avatar").replace(/[^\w.-]+/g, "_").slice(0, 64);

  const abs = path.join(folderAbs, safeName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(abs, buf);

  const relUrl = "/" + path.join(folderRel, safeName).replace(/\\/g, "/");

  // Vahid mənbə: User.avatarUrl
  await prisma.user.update({
    where: { id: patientUserId },
    data: { avatarUrl: relUrl },
  });

  return NextResponse.json({ url: relUrl }, { status: 201 });
}
