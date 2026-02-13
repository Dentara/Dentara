import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Qaytarır: həkimlər (Doctor) — DoctorPrivatePatient join-u ilə
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // patientUserId → Patient.id-lər
  const pts = await prisma.patient.findMany({
    where: { OR: [{ email: u.email || "" }, { id: u.id }] },
    select: { id: true },
    take: 10,
  });
  const ids = pts.map(p => p.id);
  if (ids.length === 0) return NextResponse.json({ doctors: [] });

  const list = await prisma.doctorPrivatePatient.findMany({
    where: { patientId: { in: ids } },
    select: { doctor: { select: { id: true, fullName: true, email: true, clinicId: true } } },
    take: 50,
  });

  const doctors = list.map(x => x.doctor);
  return NextResponse.json({ doctors });
}
