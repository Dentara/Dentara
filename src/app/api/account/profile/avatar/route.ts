import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing "file"' }, { status: 400 });
  if (!file.type?.startsWith?.("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });

  const folderRel = path.join("uploads", "avatars", u.id);
  const folderAbs = path.join(process.cwd(), "public", folderRel);
  await fs.mkdir(folderAbs, { recursive: true });

  const safe = `${Date.now()}_${Math.random().toString(36).slice(2)}_${String(file.name||"avatar").replace(/[^\w.-]+/g,"_").slice(0,64)}`;
  const abs = path.join(folderAbs, safe);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(abs, buf);

  const relUrl = "/" + path.join(folderRel, safe).replace(/\\/g, "/");
  await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: relUrl } });

  return NextResponse.json({ url: relUrl }, { status: 201 });
}
