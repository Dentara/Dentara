import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/securityLog";

export const dynamic = "force-dynamic";

const SELECT_FIELDS = {
  id: true,
  showEmailToClinics: true,
  showPhoneToClinics: true,
  showCityToClinics: true,
  allowClinicProfileAccess: true,
  showFullNamePublic: true,
  showAvatarPublic: true,
  showCityPublic: true,
  createdAt: true,
  updatedAt: true,
};

const ALLOWED_KEYS = [
  "showEmailToClinics",
  "showPhoneToClinics",
  "showCityToClinics",
  "allowClinicProfileAccess",
  "showFullNamePublic",
  "showAvatarPublic",
  "showCityPublic",
] as const;

type PrivacyBody = Partial<Record<(typeof ALLOWED_KEYS)[number], unknown>>;

function normalizeBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(v)) return true;
    if (["false", "0", "no", "off"].includes(v)) return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return undefined;
}

/**
 * GET /api/account/profile/privacy
 *
 * Mövcud settings varsa qaytarır, yoxdursa yaradır.
 * P2002 (unique userId) errorunda ikinci dəfə oxuyur, yəni race-condition da problem olmur.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 1) Mövcud settings varsa, birbaşa qaytar
  const existing = await prisma.profilePrivacySettings.findUnique({
    where: { userId: u.id },
    select: SELECT_FIELDS,
  });

  if (existing) {
    return NextResponse.json({ privacySettings: existing });
  }

  // 2) Yoxdursa, yaratmağa cəhd et
  try {
    const created = await prisma.profilePrivacySettings.create({
      data: {
        userId: u.id,
        // bütün boolean-lar schema @default ilə gəlir
      },
      select: SELECT_FIELDS,
    });
    return NextResponse.json({ privacySettings: created });
  } catch (err: any) {
    // Əgər burada P2002 olursa, demək ki bu arada başqa request artıq yaratmışdı.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const after = await prisma.profilePrivacySettings.findUnique({
        where: { userId: u.id },
        select: SELECT_FIELDS,
      });
      if (after) {
        return NextResponse.json({ privacySettings: after });
      }
    }

    console.error("PROFILE_PRIVACY_GET_ERROR", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/profile/privacy
 *
 * Body:
 * {
 *   "showEmailToClinics": true,
 *   "showPhoneToClinics": false,
 *   ...
 * }
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as PrivacyBody;

  const data: Record<string, boolean> = {};
  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      const v = normalizeBoolean(body[key]);
      if (v !== undefined) {
        data[key] = v;
      }
    }
  }

  if (!Object.keys(data).length) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  try {
    const settings = await prisma.profilePrivacySettings.upsert({
      where: { userId: u.id },
      create: {
        userId: u.id,
        ...data,
      },
      update: data,
      select: SELECT_FIELDS,
    });

    try {
      await logSecurityEvent({
        action: "PROFILE_PRIVACY_UPDATE",
        userId: u.id,
        email: (session.user as any)?.email,
        details: {
          updatedKeys: Object.keys(data),
          values: data,
        },
      });
    } catch {
      // ignore log errors
    }

    return NextResponse.json({ privacySettings: settings });
  } catch (err) {
    console.error("PROFILE_PRIVACY_PATCH_ERROR", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
