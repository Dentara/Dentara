import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Profile (sessiya istifadəçisi)
  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, name: true, email: true, role: true, emailVerified: true },
  });

  // Files — account -> patientUserId = user.id
  const files = await prisma.patientFile.findMany({
    where: { patientUserId: u.id },
    select: { id: true, title: true, path: true, mime: true, sizeBytes: true, createdAt: true, albumId: true, type: true },
    orderBy: { createdAt: "desc" },
  });

  // Appointments — həm patient, həm doctor email-ı üçün geniş axtarış
  const appts = await prisma.appointment.findMany({
    where: {
      OR: [
        { patient: { email: user?.email || "" } },
        { doctor: { email: user?.email || "" } },
      ],
    },
    select: {
      id: true, status: true, date: true, time: true,
      clinic: { select: { id: true, name: true } },
      doctor: { select: { id: true, fullName: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
    take: 2000,
  });

  // Treatments — həm patientUserId, həm də doctor/patient email-ı ilə
  const treatments = await prisma.treatmentEntry.findMany({
    where: {
      OR: [
        { patientUserId: u.id },
        { patient: { email: user?.email || "" } },
        { doctor: { email: user?.email || "" } },
      ],
    },
    select: {
      id: true, status: true, category: true, date: true, price: true,
      clinic: { select: { id: true, name: true } },
      doctor: { select: { id: true, fullName: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
      teeth: { select: { numberFDI: true } },
      attachments: { select: { patientFile: { select: { id: true, title: true, path: true } } } },
    },
    orderBy: { date: "desc" },
    take: 3000,
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    platform: "Tagiza",
    user,
    files,
    appointments: appts,
    treatments,
  };

  const body = JSON.stringify(payload, null, 2);
  const res = new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="tagiza_export_${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
  // last export cookie
  res.cookies.set({ name: "tgz_last_export", value: new Date().toISOString(), httpOnly: false, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
