// src/app/api/patients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Yaşı DOB-dan hesabla (tam illə)
function ageFromDob(d?: Date | string | null) {
  if (!d) return undefined;
  const dob = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dob.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();

    // 🔹 Session + rol
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    const clinicId =
      role === "clinic" ? ((session?.user as any)?.id as string) : undefined;

    // ============================================================
    // 1) CLINIC USER → ClinicPatient əsasında patient siyahısı
    // ============================================================
    if (clinicId) {
      const where: any = { clinicId };

      if (q) {
        where.OR = [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          {
            patientGlobal: {
              name: { contains: q, mode: "insensitive" },
            },
          },
          {
            patientGlobal: {
              email: { contains: q, mode: "insensitive" },
            },
          },
        ];
      }

      const rows = await prisma.clinicPatient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          patientGlobal: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              gender: true,
              dob: true,
              status: true,
              condition: true,
              doctor: true,
            },
          },
        },
      });

      const data = rows.map((cp) => {
        const p = (cp as any).patientGlobal as any;
        const rawStatus = p?.status || cp.status || "Active";
        const normalizedStatus =
          typeof rawStatus === "string" && rawStatus.toUpperCase() === "ACTIVE"
            ? "Active"
            : rawStatus;

        return {
          // 🔑 Əgər global Patient varsa → onun id-si, yoxdursa ClinicPatient.id
          id: p?.id ?? cp.id,
          name: p?.name || cp.fullName || "",
          email: p?.email || cp.email || "",
          phone: p?.phone || (cp as any).phone || "",
          image: p?.image || null,
          gender: p?.gender || "",
          age: p?.dob ? ageFromDob(p.dob) : undefined,
          status: normalizedStatus,
          condition: p?.condition || "",
          doctor: p?.doctor || "",
        };
      });

      return NextResponse.json(data);
    }

    // ============================================================
    // 2) Clinic deyil (global Patient cədvəli) → əvvəlki loqika
    // ============================================================
    const rows = await prisma.patient.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { doctor: { contains: q, mode: "insensitive" } },
              { condition: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        gender: true,
        dob: true, // → age üçün istifadə edirik
        status: true,
        condition: true,
        doctor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = rows.map((p) => {
      const rawStatus = p.status || "Active";
      const normalizedStatus =
        typeof rawStatus === "string" && rawStatus.toUpperCase() === "ACTIVE"
          ? "Active"
          : rawStatus;
    return {
      id: p.id,
      name: p.name || "",
      email: p.email || "",
      phone: p.phone || "",
      image: p.image || null,
      gender: p.gender || "",
      age: ageFromDob(p.dob),
      sstatus: normalizedStatus,
      condition: p.condition || "",
      doctor: p.doctor || "",
    };
  });

    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /api/patients error:", e);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
