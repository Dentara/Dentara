// app/api/patients/[id]/files/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResourceType } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function publicUrlFrom(absPath: string) {
  const rel = absPath.split("public").pop() || "";
  return rel?.replace(/\\/g, "/") ?? "";
}

// Patient.id və ya ClinicPatient.id -> User.id (patientUserId) resolver
async function resolvePatientUserIdByAnyKey(patientOrMembershipId: string) {
  // 1) Birbaşa Patient.id kimi yoxla
  const patient = await prisma.patient.findUnique({
    where: { id: patientOrMembershipId },
    select: { id: true, email: true },
  });

  if (patient) {
    if (patient.email) {
      const u = await prisma.user.findUnique({
        where: { email: patient.email },
        select: { id: true },
      });
      if (u) return u.id;
    }
    const u2 = await prisma.user.findUnique({
      where: { id: patient.id },
      select: { id: true },
    });
    return u2?.id ?? null;
  }

  // 2) Patient tapılmadı → ClinicPatient.id kimi axtar
  const cp = await prisma.clinicPatient.findUnique({
    where: { id: patientOrMembershipId },
    select: {
      patientUserId: true,
      email: true,
      patientGlobalId: true,
    },
  });
  if (!cp) return null;

  // 2a) Əgər ClinicPatient.patientUserId doludursa → birbaşa istifadə edirik
  if (cp.patientUserId) return cp.patientUserId;

  // 2b) Email üzrə User axtar
  if (cp.email) {
    const u = await prisma.user.findUnique({
      where: { email: cp.email },
      select: { id: true },
    });
    if (u) return u.id;
  }

  // 2c) Əgər patientGlobalId varsa → Patient → User
  if (cp.patientGlobalId) {
    const p2 = await prisma.patient.findUnique({
      where: { id: cp.patientGlobalId },
      select: { id: true, email: true },
    });
    if (p2) {
      if (p2.email) {
        const u = await prisma.user.findUnique({
          where: { email: p2.email },
          select: { id: true },
        });
        if (u) return u.id;
      }
      const u2 = await prisma.user.findUnique({
        where: { id: p2.id },
        select: { id: true },
      });
      if (u2) return u2.id;
    }
  }

  return null;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const url = new URL(req.url);
  const albumId = url.searchParams.get("albumId") || undefined;
  const scope = url.searchParams.get("scope") || undefined;

  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Forbidden", { status: 403 });

  const { id: patientId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  const files = await prisma.patientFile.findMany({
    where: {
      patientUserId,
      ...(albumId ? { albumId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      path: true,
      createdAt: true,
      mime: true,
      visibility: true,
      albumId: true,
    },
  });

  const enriched = await Promise.all(
    files.map(async (f) => {
      const abs = path.join(
        process.cwd(),
        "public",
        f.path.replace(/^\/+/, "")
      );
      let size: number | null = null;
      try {
        const st = await fs.stat(abs);
        size = st.size;
      } catch {}
      return {
        id: f.id,
        name: f.title || path.basename(f.path),
        url: publicUrlFrom(abs),
        createdAt: f.createdAt.toISOString(),
        size,
        visibility: (f.visibility as any) || "PRIVATE",
        mime: f.mime || null,
        albumId: f.albumId,
      };
    })
  );

  const filtered = scope
    ? enriched.filter((x) => x.url.includes(`/${scope}/`))
    : enriched;

  return NextResponse.json({ files: filtered });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name");

  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Forbidden", { status: 403 });
  if (!name) return new NextResponse("Missing file name", { status: 400 });

  const { id: patientId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  const found = await prisma.patientFile.findFirst({
    where: {
      patientUserId,
      OR: [{ title: name }, { path: { endsWith: "/" + name } }],
    },
    select: { id: true, path: true },
  });
  if (!found) return new NextResponse("Not found", { status: 404 });

  const abs = path.join(
    process.cwd(),
    "public",
    found.path.replace(/^\/+/, "")
  );
  try {
    await fs.unlink(abs);
  } catch {}

  await prisma.patientFile.delete({ where: { id: found.id } });

  return NextResponse.json({ ok: true });
}

/**
 * PATCH — faylı alboma köçür (assign)
 * Body: { fileId: string, albumId: string | null }
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json().catch(() => ({}));
  const fileId = body?.fileId as string | undefined;
  const toAlbumId = (body?.albumId as string | null | undefined) ?? null;

  if (!fileId)
    return new NextResponse("Missing fileId", { status: 400 });

  const { id: patientId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  const exists = await prisma.patientFile.findFirst({
    where: { id: fileId, patientUserId },
    select: { id: true },
  });
  if (!exists) return new NextResponse("Not found", { status: 404 });

  await prisma.patientFile.update({
    where: { id: fileId },
    data: { albumId: toAlbumId },
  });

  return NextResponse.json({ ok: true });
}

// === POST: fayl yüklə (multipart/form-data, "file" sahəsi) ===
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Forbidden", { status: 403 });

  const { id: patientId } = await ctx.params;

  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId) {
    return new NextResponse("Patient user not found", { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { error: "Invalid form-data" },
      { status: 400 }
    );
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing "file" field' },
      { status: 400 }
    );
  }

  const baseDir = process.cwd();
  const folderRel = path.join("uploads", "patientfiles", patientUserId);
  const folderAbs = path.join(baseDir, "public", folderRel);
  await fs.mkdir(folderAbs, { recursive: true });

  const safeName =
    `${Date.now()}_${Math.random().toString(36).slice(2)}_` +
    String(file.name || "file")
      .replace(/[^\w.-]+/g, "_")
      .slice(0, 80);

  const absPath = path.join(folderAbs, safeName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buf);

  const relUrl =
    "/" + path.join(folderRel, safeName).replace(/\\/g, "/");

  const mime = (file as any).type || "";
  const nameLower = (file.name || "").toLowerCase();

  let inferredType: ResourceType = ResourceType.OTHER;
  if (mime.startsWith("image/")) {
    if (mime.includes("dicom") || nameLower.endsWith(".dcm")) {
      inferredType = ResourceType.XRAY;
    } else {
      inferredType = ResourceType.PHOTO;
    }
  } else if (mime === "application/pdf") {
    inferredType = ResourceType.DOC;
  } else if (mime.includes("zip") || nameLower.endsWith(".zip")) {
    inferredType = ResourceType.LAB;
  }

  const created = await prisma.patientFile.create({
    data: {
      patientUserId,
      title: file.name || "Untitled",
      path: relUrl,
      thumbnail: null,
      mime: mime || null,
      visibility: "PRIVATE",
      albumId: null,
      sizeBytes: buf.length ?? null,
      type: inferredType,
    },
    select: {
      id: true,
      title: true,
      path: true,
      thumbnail: true,
      createdAt: true,
      mime: true,
      visibility: true,
      albumId: true,
    },
  });

  return NextResponse.json({ file: created }, { status: 201 });
}
