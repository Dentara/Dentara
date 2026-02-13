import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/securityLog";

export const dynamic = "force-dynamic";

type ProfileBody = {
  // User core fields
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;

  // PublicProfile fields
  displayName?: string;
  headline?: string;
  website?: string;
  username?: string;
  slug?: string;
  avatarUrl?: string;
  coverUrl?: string;
  socialLinks?: unknown;
  isPublic?: boolean;
};

/**
 * GET /api/account/profile
 *
 * Qaytarır:
 * {
 *   user: { ...core user fields... },
 *   publicProfile: { ... } | null,
 *   privacySettings: { ... } | null
 * }
 *
 * Köhnə frontend yalnız "user" istifadə etdiyi üçün geriyə uyğun qalır.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userWithRelations = await prisma.user.findUnique({
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
      publicProfile: {
        select: {
          id: true,
          username: true,
          slug: true,
          displayName: true,
          headline: true,
          avatarUrl: true,
          coverUrl: true,
          country: true,
          city: true,
          website: true,
          socialLinks: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      privacySettings: {
        select: {
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
        },
      },
    },
  });

  if (!userWithRelations) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { publicProfile, privacySettings, ...user } = userWithRelations;

  // Əgər profil/privaycy yoxdur, hazırda sadəcə null kimi qaytarırıq.
  // İstəsən sonradan GET zamanı auto-create də edə bilərik.

  return NextResponse.json({
    user,
    publicProfile: publicProfile ?? null,
    privacySettings: privacySettings ?? null,
  });
}

/**
 * PATCH /api/account/profile
 *
 * Body həm core User sahələrini, həm də PublicProfile sahələrini daşıya bilər.
 *
 * Məs:
 * {
 *   "name": "Sia Tagizade",
 *   "phone": "+994...",
 *   "city": "Baku",
 *   "country": "Azerbaijan",
 *   "displayName": "Dr. Sia Tagizade",
 *   "headline": "Orthodontist & Founder of Tagiza",
 *   "website": "https://tagiza.com",
 *   "username": "siatagizade",
 *   "socialLinks": [
 *     { "type": "x", "url": "https://x.com/..." }
 *   ],
 *   "isPublic": true
 * }
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as ProfileBody;

  const userData: Record<string, any> = {};
  const profileData: Record<string, any> = {};

  // ---- User core sahələri ----
  const userFields: (keyof ProfileBody)[] = [
    "name",
    "phone",
    "addressLine1",
    "addressLine2",
    "city",
    "country",
  ];

  for (const key of userFields) {
    const v = body[key];
    if (v !== undefined) {
      userData[key] = typeof v === "string" ? v.trim() : v;
    }
  }

  // ---- PublicProfile sahələri ----
  const profileFields: (keyof ProfileBody)[] = [
    "displayName",
    "headline",
    "website",
    "username",
    "slug",
    "avatarUrl",
    "coverUrl",
  ];

  for (const key of profileFields) {
    const v = body[key];
    if (v !== undefined) {
      profileData[key] = typeof v === "string" ? v.trim() : v;
    }
  }

  if (body.socialLinks !== undefined) {
    // Frontend-dən gələn JSON-u olduğu kimi saxlayırıq
    profileData.socialLinks = body.socialLinks;
  }

  if (body.isPublic !== undefined) {
    profileData.isPublic = Boolean(body.isPublic);
  }

  if (!Object.keys(userData).length && !Object.keys(profileData).length) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ---- User update və ya mövcud user-in gətirilməsi ----
      let updatedUser = await tx.user.findUnique({
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

      if (!updatedUser) {
        throw new Error("USER_NOT_FOUND");
      }

      if (Object.keys(userData).length) {
        updatedUser = await tx.user.update({
          where: { id: u.id },
          data: userData,
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
      }

      // ---- PublicProfile upsert ----
      let updatedProfile = null as null | {
        id: string;
        username: string | null;
        slug: string | null;
        displayName: string | null;
        headline: string | null;
        avatarUrl: string | null;
        coverUrl: string | null;
        country: string | null;
        city: string | null;
        website: string | null;
        socialLinks: unknown;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
      };

      if (Object.keys(profileData).length) {
        updatedProfile = await tx.publicProfile.upsert({
          where: { userId: u.id },
          update: profileData,
          create: {
            userId: u.id,
            ...profileData,
          },
          select: {
            id: true,
            username: true,
            slug: true,
            displayName: true,
            headline: true,
            avatarUrl: true,
            coverUrl: true,
            country: true,
            city: true,
            website: true,
            socialLinks: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } else {
        // profil sahəsi gəlməyibsə, mövcud profili sadəcə qaytara bilərik
        updatedProfile = (await tx.publicProfile.findUnique({
          where: { userId: u.id },
          select: {
            id: true,
            username: true,
            slug: true,
            displayName: true,
            headline: true,
            avatarUrl: true,
            coverUrl: true,
            country: true,
            city: true,
            website: true,
            socialLinks: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
        })) as any;
      }

      return { user: updatedUser, publicProfile: updatedProfile };
    });

    // Security log
    try {
      await logSecurityEvent({
        action: "PROFILE_UPDATE",
        userId: u.id,
        email: result.user.email,
        details: {
          userFields: Object.keys(userData),
          publicProfileFields: Object.keys(profileData),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      user: result.user,
      publicProfile: result.publicProfile ?? null,
    });
  } catch (err: any) {
    // Unique error (məs: username/slug artıq var)
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = err.meta?.target as string[] | string | undefined;
      const field =
        Array.isArray(target) && target.length
          ? target[0]
          : typeof target === "string"
          ? target
          : "unique";

      return NextResponse.json(
        {
          error: "CONFLICT",
          field,
          message: "Value must be unique",
        },
        { status: 409 }
      );
    }

    console.error("PROFILE_PATCH_ERROR", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
