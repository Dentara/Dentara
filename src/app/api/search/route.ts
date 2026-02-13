// app/api/search/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

async function hasVerifiedByMeta(ownerId: string) {
  try {
    const p = path.join(
      process.cwd(),
      "public",
      "uploads",
      "doctorcredentials",
      ownerId,
      ".meta.json"
    );
    const buf = await readFile(p);
    const meta = JSON.parse(buf.toString() || "{}") as Record<string, any>;
    return Object.values(meta).some(
      (m: any) => m?.isVerified === true && m?.isPublic !== false
    );
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const type = (url.searchParams.get("type") || "all").toLowerCase();

  // Region parametrləri
  const scopeRaw = (url.searchParams.get("scope") || "global").toLowerCase();
  const scope: "local" | "country" | "global" =
    scopeRaw === "local" || scopeRaw === "country" ? (scopeRaw as any) : "global";

  const country = (url.searchParams.get("country") || "").trim();
  const city = (url.searchParams.get("city") || "").trim();

  const take = 24;
  const like = q ? { contains: q, mode: "insensitive" as const } : undefined;

  // Region filter helper-ləri
  const buildClinicLocationWhere = () => {
    if (scope === "global") return undefined;
    if (!country) return undefined;

    if (scope === "local") {
      if (city) {
        return {
          country,
          city: { contains: city, mode: "insensitive" as const },
        };
      }
      return { country };
    }

    // scope === "country"
    return { country };
  };

  const buildDoctorLocationWhere = () => {
    if (scope === "global") return undefined;
    if (!country) return undefined;

    if (scope === "local") {
      // local: həm doctor, həm clinic location-a baxırıq
      if (city) {
        return {
          OR: [
            {
              country,
              city: { contains: city, mode: "insensitive" as const },
            },
            {
              clinic: {
                country,
                city: { contains: city, mode: "insensitive" as const },
              },
            },
          ],
        };
      }
      return {
        OR: [{ country }, { clinic: { country } }],
      };
    }

    // scope === "country"
    return {
      OR: [{ country }, { clinic: { country } }],
    };
  };

  // -------------------- CLINICS --------------------
  const getClinics = async () => {
    const nameCond = q ? { name: like } : undefined;
    const locCond = buildClinicLocationWhere();

    const where =
      nameCond || locCond
        ? {
            AND: [
              nameCond || {},
              locCond || {},
            ],
          }
        : undefined;

    // 1) Clinic cədvəli — country/city də var
    let clinics =
      (await prisma.clinic
        .findMany({
          where,
          take,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            country: true,
            city: true,
          },
        })
        .catch(() => [])) || [];

    // 2) Fallback: User.role="clinic" → ad/email ilə (region filteri sadəcə name search üçün)
    if (!clinics || clinics.length === 0) {
      const userWhere =
        q || country
          ? {
              AND: [
                { role: "clinic" as any },
                ...(q ? [{ OR: [{ name: like }, { email: like }] }] : []),
              ],
            }
          : { role: "clinic" as any };

      const clinicUsers =
        (await prisma.user
          .findMany({
            where: userWhere,
            take,
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              country: true as any,
              city: true as any,
            },
          })
          .catch(() => [])) || [];

      clinics = clinicUsers.map((u) => ({
        id: u.id,
        name: u.name || "Clinic",
        country: (u as any).country ?? null,
        city: (u as any).city ?? null,
      }));
    }

    // 3) Yenə boşdursa — ən azı nəsə qaytar (region filteri olmadan)
    if (!clinics || clinics.length === 0) {
      clinics =
        (await prisma.clinic
          .findMany({
            take,
            select: { id: true, name: true, country: true, city: true },
          })
          .catch(() => [])) || [];
    }
    return clinics;
  };

  // -------------------- PATIENTS --------------------
  const getPatients = async () => {
    let patients =
      (await prisma.patient
        .findMany({
          where: q ? { OR: [{ name: like }] } : undefined,
          take,
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
        .catch(() => [])) || [];

    if (!patients || patients.length === 0) {
      const users =
        (await prisma.user
          .findMany({
            where: q
              ? {
                  AND: [
                    { role: "patient" as any },
                    { OR: [{ name: like }, { email: like }] },
                  ],
                }
              : { role: "patient" as any },
            take,
            orderBy: { name: "asc" },
            select: { id: true, name: true },
          })
          .catch(() => [])) || [];
      patients = users.map((u) => ({ id: u.id, name: u.name || "Patient" }));
    }
    return patients;
  };

  // -------------------- DOCTORS (+ hasVerified) --------------------
  const getDoctors = async () => {
    const whereName = q
      ? {
          OR: [
            { fullName: like },
            { email: like },
            { specialization: like },
          ],
        }
      : undefined;

    const whereLoc = buildDoctorLocationWhere();

    const where =
      whereName || whereLoc
        ? {
            AND: [
              whereName || {},
              whereLoc || {},
            ],
          }
        : undefined;

    // 1) Doctor cədvəli
    let doctors =
      (await prisma.doctor
        .findMany({
          where,
          take,
          orderBy: { fullName: "asc" },
          select: {
            id: true,
            fullName: true,
            email: true,
            specialization: true,
            country: true,
            city: true,
            clinic: {
              select: { id: true, name: true, country: true, city: true },
            },
          },
        })
        .catch(() => [])) || [];

    // 2) Fallback: User.role="doctor"
    if (!doctors || doctors.length === 0) {
      const userWhere =
        q || country
          ? {
              AND: [
                { role: "doctor" as any },
                ...(q ? [{ OR: [{ name: like }, { email: like }] }] : []),
              ],
            }
          : { role: "doctor" as any };

      const usersAsDoctors =
        (await prisma.user
          .findMany({
            where: userWhere,
            take,
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              email: true,
              country: true as any,
              city: true as any,
            },
          })
          .catch(() => [])) || [];

      doctors = usersAsDoctors.map((u) => ({
        id: u.id,
        fullName: null,
        name: u.name,
        email: u.email,
        specialization: null,
        clinic: null,
        country: (u as any).country ?? null,
        city: (u as any).city ?? null,
      })) as any[];
    }

    // 3) hasVerified hesabla (DB → meta fallback)
    const out = [];
    for (const d of doctors) {
      let ownerId: string | null = null;

      if (d?.email) {
        try {
          const u = await prisma.user.findFirst({
            where: { email: d.email },
            select: { id: true },
          });
          if (u?.id) ownerId = u.id;
        } catch {}
      }
      if (!ownerId) ownerId = d.id;

      let hasVerified = false;
      try {
        const c = await (prisma as any).doctorCredential.count({
          where: { doctorId: ownerId, isPublic: true, isVerified: true },
        });
        hasVerified = c > 0;
      } catch {
        hasVerified = await hasVerifiedByMeta(ownerId);
      }

      out.push({ ...d, hasVerified });
    }
    return out;
  };

  try {
    if (type === "clinic") {
      const clinics = await getClinics();
      return NextResponse.json({ clinics, doctors: [], patients: [] });
    }
    if (type === "patient") {
      const patients = await getPatients();
      return NextResponse.json({ clinics: [], doctors: [], patients });
    }
    if (type === "doctor") {
      const doctors = await getDoctors();
      return NextResponse.json({ clinics: [], doctors, patients: [] });
    }

    // type === "all"
    const [clinics, doctors, patients] = await Promise.all([
      getClinics(),
      getDoctors(),
      getPatients(),
    ]);
    return NextResponse.json({ clinics, doctors, patients });
  } catch {
    return NextResponse.json({ clinics: [], doctors: [], patients: [] });
  }
}
