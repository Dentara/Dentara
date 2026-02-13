// app/api/clinic/patient-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

/**
 * GET /api/clinic/patient-search?q=...&limit=25
 * Dönüş: { items: [{ id, name, email, phone, image, gender, age }] }
 * Qeyd:
 * - Klinikaya bağlı pasiyentləri **ClinicPatient** üzərindən çəkir.
 * - Yalnız **patientGlobal** (Patient cədvəli) olanları qaytarırıq ki,
 *   /dashboard/patients/[id]/files route-u Patient.id ilə işləsin.
 */
export async function GET(req: NextRequest) {
  // Session guard
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ items: [] }, { status: 401 });

  const u: any = session.user;
  // clinic admin → öz id; digərləri → session.user.clinicId
  const clinicId: string | undefined =
    u?.role === "clinic" ? (u?.id as string) : (u?.clinicId as string | undefined);
  if (!clinicId) return NextResponse.json({ items: [] });

  const url = new URL(req.url);
  const rawQ = (url.searchParams.get("q") || url.searchParams.get("query") || "").trim();
  const q = rawQ.toLowerCase();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 25), 1), 100);

  // ClinicPatient → patientGlobal (Patient) + patientUser (User) relation-larını çəkirik
  const joins = await (prisma as any).clinicPatient.findMany({
    where: { clinicId },
    include: {
      patientGlobal: {
        select: { id: true, name: true, email: true, phone: true, image: true, gender: true, dob: true },
      },
      patientUser: {
        select: { id: true, name: true, email: true, image: true }, // ehtiyat üçün (filtr üçündür)
      },
    },
    take: Math.max(limit * 2, 50), // JS-də filtr edəcəyik, ona görə bir az çox götürürük
  });

  // Yalnız patientGlobal (Patient cədvəli) olanları map edirik
  const raw = (joins || [])
    .map((cp: any) => {
      const g = cp?.patientGlobal; // Patient
      const u2 = cp?.patientUser;  // User (fallback yalnız filtrləmə üçün)
      if (!g?.id) return null;     // Patient.id yoxdursa, bu nəticəni SKİP EDİRİK
      return {
        id: g.id as string,                            // MÜTLƏQ Patient.id — Files route buna bağlıdır
        name: (g.name || u2?.name || "") as string,
        email: (g.email || u2?.email || "") as string,
        phone: (g.phone || null) as string | null,
        image: (g.image || u2?.image || null) as string | null,
        gender: (g.gender || null) as string | null,
        age: g?.dob ? (ageFromDob(g.dob) ?? null) : null,
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      image: string | null;
      gender: string | null;
      age: number | null;
    }[];

  // JS-də text filter (ad/email/phone)
  const filtered = q
    ? raw.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.email || "").toLowerCase().includes(q) ||
          (p.phone || "").toLowerCase().includes(q)
      )
    : raw;

  // uniq (id üzrə) + sort + limit
  const uniq = new Map<string, (typeof filtered)[number]>();
  for (const p of filtered) uniq.set(p.id, p);
  const items = Array.from(uniq.values())
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    .slice(0, limit);

  return NextResponse.json({ items });
}
