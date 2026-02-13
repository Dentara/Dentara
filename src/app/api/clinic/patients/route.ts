// app/api/clinic/patients/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ClinicPatientOut = {
  id: string;
  fullName: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  // Schema-da patientId YOXDUR, amma type-i pozmamaq üçün null saxlayırıq
  patientId: string | null;
  patientUserId: string | null;
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const clinicId =
    role === "clinic" ? ((session?.user as any)?.id as string) : undefined;

  if (!clinicId) {
    return NextResponse.json(
      { patients: [] as ClinicPatientOut[] },
      { status: 200 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const statusParam = (searchParams.get("status") || "ACTIVE").toUpperCase();

  const where: any = {
    clinicId,
  };

  if (statusParam !== "ALL") {
    where.status = statusParam;
  }

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.clinicPatient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    // ⚠️ Burada yalnız modeli-də HƏQİQİ mövcud olan field-ləri seçirik
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      createdAt: true,
      patientUserId: true, // bu var
      // patientId YOXDUR – seçmirik
    },
  });

  const patients: ClinicPatientOut[] = rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    status: row.status,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    patientId: null, // modeldə bu yoxdur, ona görə null saxlayırıq
    patientUserId: row.patientUserId,
  }));

  return NextResponse.json({ patients });
}
