export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readdir, stat, readFile } from "fs/promises";
import path from "path";

type SafeCred = {
  id: string;
  title: string | null;
  issuedBy?: string | null;
  year?: number | null;
  isPublic: boolean;
  isVerified?: boolean | null;
  filePath?: string | null;
};

async function readMeta(userOrDoctorId: string) {
  try {
    const p = path.join(process.cwd(), "public", "uploads", "doctorcredentials", userOrDoctorId, ".meta.json");
    const buf = await readFile(p);
    return JSON.parse(buf.toString() || "{}") as Record<
      string,
      { isPublic?: boolean; isVerified?: boolean; title?: string; issuedBy?: string; year?: number }
    >;
  } catch {
    return {};
  }
}

async function listFromFS(ownerId: string): Promise<SafeCred[]> {
  const out: SafeCred[] = [];
  const base = path.join(process.cwd(), "public", "uploads", "doctorcredentials", ownerId);
  const meta = await readMeta(ownerId);
  try {
    const names = await readdir(base);
    for (const name of names) {
      if (name === ".meta.json") continue;
      const st = await stat(path.join(base, name)).catch(() => null);
      if (!st || !st.isFile()) continue;

      const m = meta[name] || {};
      // yalnız public olanları göstər
      if (m.isPublic === false) continue;

      out.push({
        id: name,
        title: m.title ?? name,
        issuedBy: m.issuedBy ?? null,
        year: typeof m.year === "number" ? m.year : null,
        isPublic: m.isPublic !== false,
        isVerified: !!m.isVerified,
        filePath: `/uploads/doctorcredentials/${ownerId}/${name}`,
      });
    }
  } catch {
    // qovluq yoxdur → boş
  }
  // sadə sıralama
  out.sort((a, b) => (a.title! > b.title! ? -1 : 1));
  return out;
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const key = decodeURIComponent(slug || "").trim();
  if (!key) return NextResponse.json({ item: null }, { status: 404 });

  // 1) Doctor (schema-safe)
  let doctor:
    | {
        id: string;
        fullName: string | null;
        email?: string | null;
        specialization?: string | null;
        clinic?: { name?: string | null } | null;
        country?: string | null;
        city?: string | null;
      }
    | null = null;

  try {
    doctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { fullName: { contains: key, mode: "insensitive" } },
          { email: { contains: key, mode: "insensitive" } },
          { specialization: { contains: key, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        specialization: true,
        clinic: { select: { name: true } },
        country: true,
        city: true,
      },
      orderBy: { fullName: "asc" },
    });
  } catch {}

  // 2) Müvafiq User (role=doctor) – varsa, owner kimi onu istifadə edəcəyik
  let userForDoctor: { id: string; email: string | null; name: string | null; avatarUrl?: string | null } | null = null;
  if (doctor?.email) {
    try {
      const u = await prisma.user.findFirst({
        where: { email: doctor.email },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true as any,
          country: true as any,
          city: true as any,
        },
      });
      if (u) userForDoctor = u;
    } catch {}
  }
  if (!doctor) {
    try {
      const u = await prisma.user.findFirst({
        where: {
          AND: [
            { role: "doctor" as any },
            { OR: [{ name: { contains: key, mode: "insensitive" } }, { email: { contains: key, mode: "insensitive" } }] },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true as any,
          country: true as any,
          city: true as any,
        },
        orderBy: { name: "asc" },
      });
        if (u) {
          userForDoctor = u;
          doctor = {
            id: u.id,
            fullName: u.name,
            email: u.email,
            specialization: null,
            clinic: null,
            country: (u as any).country ?? null,
            city: (u as any).city ?? null,
          };
        }
    } catch {}
  }

  if (!doctor) return NextResponse.json({ item: null }, { status: 404 });

  const ownerId = userForDoctor?.id || doctor.id; // FS-də faylların sahib qovluğu
  let credentials: SafeCred[] = [];

  // 3) Əvvəl DoctorCredential (DB) – isPublic=true
  let usedDb = false;
  try {
    const list = (await (prisma as any).doctorCredential.findMany({
      where: { doctorId: ownerId, isPublic: true },
      orderBy: { year: "desc" },
      select: { id: true, title: true, issuedBy: true, year: true, isPublic: true, isVerified: true, filePath: true },
    })) as any[];
    if (list?.length) usedDb = true;
    credentials = (list || []).map((c) => ({
      id: c.id,
      title: c.title ?? "Credential",
      issuedBy: c.issuedBy ?? null,
      year: typeof c.year === "number" ? c.year : null,
      isPublic: !!c.isPublic,
      isVerified: !!c.isVerified,
      filePath: c.filePath ?? null,
    }));
  } catch {
    usedDb = false;
  }

  // 4) DB tapılmadısa → FS + meta (yalnız ownerId qovluğu)
  if (!usedDb || credentials.length === 0) {
    credentials = await listFromFS(ownerId);
  }

  const avatarUrl = (userForDoctor as any)?.avatarUrl || null;

  // Rating + son 10 public review (doctorId ilə)
  let ratingAvg = 0;
  let ratingCount = 0;
  let reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    clinicName: string | null;
  }> = [];

  try {
    const agg = await prisma.treatmentReview.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
      where: { isPublic: true, treatment: { doctorId: doctor.id } },
    });
    ratingAvg = Number(agg._avg.rating ?? 0);
    ratingCount = Number(agg._count._all ?? 0);

    const list = await prisma.treatmentReview.findMany({
      where: { isPublic: true, treatment: { doctorId: doctor.id } },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        treatment: { select: { clinic: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    reviews = list.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: r.createdAt.toISOString(),
      clinicName: r.treatment?.clinic?.name ?? null,
    }));
  } catch {}

  return NextResponse.json({
    item: doctor,
    credentials,
    avatarUrl,
    ratingAvg,
    ratingCount,
    reviews,
  });

}
