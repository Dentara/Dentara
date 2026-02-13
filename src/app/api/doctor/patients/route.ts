import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * POST /api/doctor/patients
 * Body: { name, email, phone? }
 * Şərt: session.user.role === "doctor" və doctor klinikaya link DEYİL (primary clinicId yoxdur)
 * Effekt:
 *  - Patient (yoxdursa) yaradılır
 *  - (email → User) login üçün user yoxdursa sadə user açılır (random parol), amma email təsdiqi olmadan giriş olmayacaq
 *  - DoctorPrivatePatient join yaradılır
 *  - Qaytarır: { patient }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id || String(u?.role) !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Doctor klinikaya linklidirmi? -> əgər linklidirsə, bu axın deaktivdir
  const doc = await prisma.doctor.findFirst({
    where: { email: u.email || "" },
    select: { id: true, clinicId: true },
  });
  if (!doc) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  if (doc.clinicId) {
    return NextResponse.json({ error: "Doctor is linked to a clinic. Use clinic patient flow." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const phone = body?.phone ? String(body.phone).trim() : null;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  // 1) Patient tap / yarat
  let patient = await prisma.patient.findFirst({
    where: { OR: [{ email }, { name }] },
    select: { id: true, name: true, email: true },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: { name, email, phone },
      select: { id: true, name: true, email: true },
    });
  }

  // 2) User (email → User.id) yoxdursa minimal user aç (parol random + verify=false)
  const userExisting = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!userExisting) {
    const rnd = Math.random().toString(36).slice(2, 10) + "A1!";
    const hash = await bcrypt.hash(rnd, 10);
    await prisma.user.create({
      data: {
        email,
        name,
        role: "patient",
        password: hash,
        emailVerified: false,
      },
    });
  }

  // 3) Join (DoctorPrivatePatient) yarad
  await prisma.doctorPrivatePatient.upsert({
    where: { doctorId_patientId: { doctorId: doc.id, patientId: patient.id } },
    update: {},
    create: { doctorId: doc.id, patientId: patient.id },
  });

  return NextResponse.json({ patient });
}

/**
 * GET /api/doctor/patients
 * → Həkimin şəxsi pasiyentləri (join üzrə)
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id || String(u?.role) !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = await prisma.doctor.findFirst({
    where: { email: u.email || "" },
    select: { id: true },
  });
  if (!doc) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const list = await prisma.doctorPrivatePatient.findMany({
    where: { doctorId: doc.id },
    select: { patient: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  const rows = list.map(x => x.patient);
  return NextResponse.json({ patients: rows });
}
