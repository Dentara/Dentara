export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { writeFile, mkdir, readdir, readFile, stat, writeFile as fsWrite } from "fs/promises";
import path from "path";

type MetaMap = Record<
  string,
  { isPublic?: boolean; isVerified?: boolean; title?: string; issuedBy?: string; year?: number }
>;

const dirFor = (uid: string) => path.join(process.cwd(), "public", "uploads", "doctorcredentials", uid);
const metaPathFor = (uid: string) => path.join(dirFor(uid), ".meta.json");

async function readMeta(uid: string): Promise<MetaMap> {
  try {
    const buf = await readFile(metaPathFor(uid));
    return JSON.parse(buf.toString() || "{}") as MetaMap;
  } catch {
    return {};
  }
}
async function writeMeta(uid: string, meta: MetaMap) {
  await fsWrite(metaPathFor(uid), JSON.stringify(meta, null, 2));
}

function toSafeItem(filename: string, meta: MetaMap) {
  const m = meta[filename] || {};
  return {
    id: filename,
    title: m.title ?? filename,
    issuedBy: m.issuedBy ?? null,
    year: typeof m.year === "number" ? m.year : null,
    isPublic: m.isPublic !== false, // default true
    isVerified: !!m.isVerified,
    filePath: `/uploads/doctorcredentials/__UID__/${filename}`, // __UID__ sonradan əvəzləyəcəyik
  };
}

// Prefer DoctorCredential modeli varsa onu qaytarırıq (DB rejimi).
async function tryPrismaList(uid: string) {
  try {
    const list = await (prisma as any).doctorCredential.findMany({
      where: { doctorId: uid },
      orderBy: { year: "desc" },
      select: { id: true, title: true, issuedBy: true, year: true, isPublic: true, isVerified: true, filePath: true },
    });
    return list.map((c: any) => ({
      id: c.id,
      title: c.title ?? "Credential",
      issuedBy: c.issuedBy ?? null,
      year: typeof c.year === "number" ? c.year : null,
      isPublic: !!c.isPublic,
      isVerified: !!c.isVerified,
      filePath: c.filePath ?? null,
    }));
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return NextResponse.json({ items: [] });

  // 1) varsa DoctorCredential → DB rejimi
  const db = await tryPrismaList(uid);
  if (db) return NextResponse.json({ items: db });

  // 2) FS + meta rejimi
  const folder = dirFor(uid);
  await mkdir(folder, { recursive: true });
  const meta = await readMeta(uid);

  const names = await readdir(folder);
  const files = [];
  for (const name of names) {
    if (name === ".meta.json") continue;
    const st = await stat(path.join(folder, name)).catch(() => null);
    if (!st || !st.isFile()) continue;
    files.push(name);
  }
  // ən yenilər üstə – fayl adında timestamp prefiksimiz var
  files.sort((a, b) => (a > b ? -1 : 1));

  const items = files.map((fn) => {
    const it = toSafeItem(fn, meta);
    return { ...it, filePath: it.filePath!.replace("__UID__", uid) };
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });

  const title = (form.get("title") as string) || "Credential";
  const issuedBy = (form.get("issuedBy") as string) || null;
  const year = form.get("year") ? Number(form.get("year")) || null : null;
  const isPublic = String(form.get("isPublic") ?? "true") === "true";

  // DB rejimi varsa → onu istifadə et
  try {
    const publicPath = `/uploads/doctorcredentials/${uid}/${Date.now()}_${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await mkdir(dirFor(uid), { recursive: true });
    await writeFile(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")), bytes);

    const created = await (prisma as any).doctorCredential.create({
      data: { doctorId: uid, title, issuedBy, year, isPublic, isVerified: false, filePath: publicPath },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch {
    // FS + meta rejimi
    const folder = dirFor(uid);
    await mkdir(folder, { recursive: true });
    const safeName = `${Date.now()}_${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const diskPath = path.join(folder, safeName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(diskPath, bytes);

    const meta = await readMeta(uid);
    meta[safeName] = { title, issuedBy: issuedBy || undefined, year: year ?? undefined, isPublic };
    await writeMeta(uid, meta);

    return NextResponse.json({
      ok: true,
      id: safeName,
      filePath: `/uploads/doctorcredentials/${uid}/${safeName}`,
    });
  }
}
