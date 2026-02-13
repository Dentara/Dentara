// app/api/patients/[id]/files/upload/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

// xahiş: layihədə sharp qurulu olmalıdır:
//   npm i sharp
let sharp: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sharp = require("sharp");
} catch {
  sharp = null;
}

const prisma = new PrismaClient();

export const runtime = "nodejs";

function ensureSafeName(name: string) {
  return name.replace(/[^\w.\-@]+/g, "_");
}

// Patient.id və ya ClinicPatient.id → patientUserId resolver
async function resolvePatientUserIdByAnyKey(patientOrMembershipId: string) {
  // 1) Patient.id kimi cəhd et
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

  // 2) ClinicPatient.id kimi cəhd et
  const cp = await prisma.clinicPatient.findUnique({
    where: { id: patientOrMembershipId },
    select: {
      patientUserId: true,
      email: true,
      patientGlobalId: true,
    },
  });
  if (!cp) return null;

  if (cp.patientUserId) return cp.patientUserId;

  if (cp.email) {
    const u = await prisma.user.findUnique({
      where: { email: cp.email },
      select: { id: true },
    });
    if (u) return u.id;
  }

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

const ONE_MB = 1_000_000;

// Şəkil faylını 1MB altına salmaq üçün sıxma (webp)
async function compressImageToUnder1MB(
  input: Buffer
): Promise<{ buf: Buffer; ext: string; mime: string }> {
  if (!sharp) return { buf: input, ext: "", mime: "" };

  let q = 82; // keyfiyyət
  let width = 2000; // başlanğıc genişlik
  let buf = input;

  for (let i = 0; i < 6; i++) {
    const out = await sharp(buf)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: q })
      .toBuffer();

    if (out.length <= ONE_MB || (q <= 50 && width <= 900)) {
      return { buf: out, ext: ".webp", mime: "image/webp" };
    }

    q -= 8;
    width = Math.round(width * 0.8);
    buf = input;
  }

  const out = await sharp(input).webp({ quality: 50 }).toBuffer();
  return { buf: out, ext: ".webp", mime: "image/webp" };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Forbidden", { status: 403 });

  const url = new URL(req.url);
  const scope = (url.searchParams.get("scope") || "xrays").toLowerCase();
  const albumId = url.searchParams.get("albumId") || undefined;

  const form = await req.formData().catch(() => null);
  if (!form) return new NextResponse("Invalid form-data", { status: 400 });

  const file = form.get("file") as File | null;
  if (!file) return new NextResponse("No file", { status: 400 });

  const { id: patientId } = await ctx.params;
  const patientUserId = await resolvePatientUserIdByAnyKey(patientId);
  if (!patientUserId)
    return new NextResponse("Patient user not found", { status: 404 });

  // Faylı oxu
  const arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  let safeName = ensureSafeName(file.name);
  let mime = (file as any).type || "";

  // Yalnız şəkilləri sıxırıq
  const isImage =
    /^image\//i.test(mime || "") ||
    /\.(jpe?g|png|webp|gif|bmp|tiff)$/i.test(safeName);
  if (isImage && buffer.length > ONE_MB) {
    try {
      const out = await compressImageToUnder1MB(buffer);
      buffer = out.buf;
      mime = out.mime || mime || "image/webp";
      if (out.ext) {
        const base = safeName.replace(/\.[a-z0-9]+$/i, "");
        safeName = base + out.ext;
      }
    } catch (e) {
      console.error("compress failed:", e);
    }
  }

  // Fayl yolu: /public/uploads/patients/<User.id>/<scope>/<name>
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "patients",
    patientUserId,
    scope
  );
  await fs.mkdir(dir, { recursive: true });

  const dest = path.join(dir, safeName);
  await fs.writeFile(dest, buffer);

  const relPath = dest.split("public").pop()!.replace(/\\/g, "/");

  const SAFE_TYPE = "XRAY" as any;

  const created = await prisma.patientFile.create({
    data: {
      patientUserId,
      type: SAFE_TYPE,
      title: safeName,
      path: relPath,
      mime: mime || null,
      uploadedByType: "CLINIC",
      uploadedByClinicId: (session.user as any).clinicId ?? null,
      uploadedByDoctorUserId: null,
      albumId: albumId || null,
      sizeBytes: buffer.length,
    },
  });

  return NextResponse.json({
    ok: true,
    file: {
      id: created.id,
      name: created.title,
      url: relPath,
      createdAt: created.createdAt.toISOString(),
      size: created.sizeBytes ?? buffer.length,
      albumId: created.albumId,
    },
  });
}
