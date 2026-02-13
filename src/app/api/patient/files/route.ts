// app/api/patient/files/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function publicUrlFrom(absPath: string) {
  const rel = absPath.split("public").pop() || "";
  return rel?.replace(/\\/g, "/") ?? "";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const albumId = url.searchParams.get("albumId") || undefined;
  const scope = url.searchParams.get("scope") || undefined;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Forbidden", { status: 403 });

  // session.user.email → User.id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const files = await prisma.patientFile.findMany({
    where: {
      patientUserId: user.id,
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
      const abs = path.join(process.cwd(), "public", f.path.replace(/^\/+/, ""));
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

  const filtered = scope ? enriched.filter((x) => x.url.includes(`/${scope}/`)) : enriched;

  return NextResponse.json({ files: filtered });
}
