import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file"' }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  const baseDir = process.cwd();
  const folderRel = path.join("uploads", "avatars", user.id);
  const folderAbs = path.join(baseDir, "public", folderRel);
  await fs.mkdir(folderAbs, { recursive: true });

  const safeName =
    `${Date.now()}_${Math.random().toString(36).slice(2)}_` +
    String(file.name || "avatar").replace(/[^\w.-]+/g, "_").slice(0, 64);

  const absPath = path.join(folderAbs, safeName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buf);

  const relUrl = "/" + path.join(folderRel, safeName).replace(/\\/g, "/");
await (await import("@/lib/prisma")).default.user.update({
  where: { id: user.id },
  data: { avatarUrl: relUrl },
});
  const res = NextResponse.json({ url: relUrl }, { status: 201 });
  // 1 il saxlayırıq
  res.cookies.set({
    name: `avatar_${user.id}`,
    value: relUrl,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
