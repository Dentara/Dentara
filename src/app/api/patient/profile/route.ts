// app/api/patient/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET  /api/patient/profile
 *   → { user: { id, name, email, role, emailVerified, phone, addressLine1, addressLine2, city, country } }
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      country: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ user });
}

/**
 * PATCH /api/patient/profile
 * Body (any subset):
 *  { name?, phone?, addressLine1?, addressLine2?, city?, country? }
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const name         = typeof body?.name === "string" ? body.name.trim() : undefined;
  const phone        = typeof body?.phone === "string" ? body.phone.trim() : undefined;
  const addressLine1 = typeof body?.addressLine1 === "string" ? body.addressLine1.trim() : undefined;
  const addressLine2 = typeof body?.addressLine2 === "string" ? body.addressLine2.trim() : undefined;
  const city         = typeof body?.city === "string" ? body.city.trim() : undefined;
  const country      = typeof body?.country === "string" ? body.country.trim() : undefined;

  // Heç nə göndərilməyibsə
  if ([name, phone, addressLine1, addressLine2, city, country].every(v => v === undefined)) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: u.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(addressLine1 !== undefined ? { addressLine1 } : {}),
      ...(addressLine2 !== undefined ? { addressLine2 } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(country !== undefined ? { country } : {}),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      country: true,
    },
  });

  return NextResponse.json({ user: updated });
}
