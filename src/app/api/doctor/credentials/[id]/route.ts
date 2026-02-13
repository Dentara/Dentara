export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const folder = (id: string) => path.join(process.cwd(), "public", "uploads", "doctorcredentials", id);
const metaPath = (id: string) => path.join(folder(id), ".meta.json");

async function readMeta(id: string) {
  try { const b = await fs.readFile(metaPath(id)); return JSON.parse(b.toString() || "{}"); } catch { return {}; }
}
async function writeMeta(id: string, meta: any) {
  await fs.mkdir(folder(id), { recursive: true });
  await fs.writeFile(metaPath(id), JSON.stringify(meta, null, 2));
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // filename or row id
  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.id as string | undefined;
  const email = (session?.user as any)?.email as string | undefined;
  if (!uid) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { isPublic, isVerified, action } = body || {};

  // 1) DB rejimi (DoctorCredential)
  try {
    if (action === "requestVerify") {
      const updated = await (prisma as any).doctorCredential.update({
        where: { id },
        data: { verifyRequested: true },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, id: updated.id });
    }
    if (action === "approve") {
      const updated = await (prisma as any).doctorCredential.update({
        where: { id },
        data: { isVerified: true, verifyRequested: false },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, id: updated.id });
    }
    const data: any = {};
    if (typeof isPublic === "boolean") data.isPublic = isPublic;
    if (typeof isVerified === "boolean") data.isVerified = isVerified;
    const updated = await (prisma as any).doctorCredential.update({ where: { id }, data, select: { id: true } });
    return NextResponse.json({ ok: true, id: updated.id });
  } catch {
    // 2) FS + meta rejimi
    // əsas qovluq: userId
    const applyMeta = async (ownerId: string) => {
      const meta = await readMeta(ownerId);
      if (!meta[id]) meta[id] = {};
      if (action === "requestVerify") meta[id].verifyRequested = true;
      if (action === "approve") { meta[id].isVerified = true; meta[id].verifyRequested = false; }
      if (typeof isPublic === "boolean") meta[id].isPublic = isPublic;
      if (typeof isVerified === "boolean") meta[id].isVerified = isVerified;
      await writeMeta(ownerId, meta);
    };

    await applyMeta(uid);

    // Sığorta: eyni fayl doctor.id qovluğunda ola bilər
    try {
      if (email) {
        const doc = await prisma.doctor.findFirst({ where: { email }, select: { id: true } });
        if (doc?.id && doc.id !== uid) await applyMeta(doc.id);
      }
    } catch {}

    return NextResponse.json({ ok: true, id });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.id as string | undefined;
  const email = (session?.user as any)?.email as string | undefined;
  if (!uid) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  // 1) DB
  try {
    const found = await (prisma as any).doctorCredential.findUnique({ where: { id }, select: { filePath: true } });
    if (found?.filePath) {
      const disk = path.join(process.cwd(), "public", found.filePath.replace(/^\//, ""));
      await fs.unlink(disk).catch(() => {});
    }
    await (prisma as any).doctorCredential.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    // 2) FS
    const tryDelete = async (ownerId: string) => {
      const disk = path.join(folder(ownerId), id);
      await fs.unlink(disk).catch(() => {});
      const meta = await readMeta(ownerId);
      if (meta[id]) { delete meta[id]; await writeMeta(ownerId, meta); }
    };
    await tryDelete(uid);
    try {
      if (email) {
        const doc = await prisma.doctor.findFirst({ where: { email }, select: { id: true } });
        if (doc?.id && doc.id !== uid) await tryDelete(doc.id);
      }
    } catch {}
    return NextResponse.json({ ok: true });
  }
}
