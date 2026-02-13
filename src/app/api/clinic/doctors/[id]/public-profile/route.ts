import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/securityLog";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Klinikadan baxanda DOCTOR public profilini qaytarır.
 *
 * Path-id əsasən Doctor.id kimi nəzərdə tutulub.
 * Lakin aşağıdakı ardıcıllıqla membership yoxlanır:
 *
 * 1) Doctor.id + Doctor.clinicId === clinicId
 * 2) ClinicDoctor.doctorId === id && ClinicDoctor.clinicId === clinicId
 *
 * Yalnız bu halda klinikaya görünür.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;

  if (!u?.id || u.role !== "clinic") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const clinicId = u.id as string;

  // 1) Doctor modelindən klinika ilə birbaşa əlaqə (Doctor.clinicId)
  let doctor = await prisma.doctor.findFirst({
    where: {
      id,
      clinicId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      clinicId: true,
      userId: true,
    },
  });

  // 2) Əgər Doctor.clinicId uyğun gəlmirsə, ClinicDoctor join-lə membership yoxlayırıq
  if (!doctor) {
    const link = await prisma.clinicDoctor.findFirst({
      where: {
        clinicId,
        doctorId: id,
      },
      select: {
        doctorId: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    doctor = await prisma.doctor.findUnique({
      where: { id: link.doctorId },
      select: {
        id: true,
        fullName: true,
        email: true,
        clinicId: true,
        userId: true,
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
  }

  // Doctor ilə əlaqəli User tapmaq
  let doctorUserId: string | null = doctor.userId ?? null;

  // Əgər userId yoxdursa, email → User.id
  if (!doctorUserId && doctor.email) {
    const userByEmail = await prisma.user.findFirst({
      where: { email: doctor.email },
      select: { id: true },
    });
    if (userByEmail) {
      doctorUserId = userByEmail.id;
    }
  }

  // Əgər yenə də tapılmasa, fallback: User.id == Doctor.id
  if (!doctorUserId) {
    const userById = await prisma.user.findUnique({
      where: { id: doctor.id },
      select: { id: true },
    });
    if (userById) {
      doctorUserId = userById.id;
    }
  }

  if (!doctorUserId) {
    return NextResponse.json(
      { error: "Doctor account is not linked to a user" },
      { status: 404 }
    );
  }

  // User + PublicProfile + PrivacySettings
  const user = await prisma.user.findUnique({
    where: { id: doctorUserId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
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
        },
      },
      privacySettings: {
        select: {
          showEmailToClinics: true,
          showPhoneToClinics: true,
          showCityToClinics: true,
          allowClinicProfileAccess: true,
          showFullNamePublic: true,
          showAvatarPublic: true,
          showCityPublic: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const privacy = user.privacySettings ?? {
    showEmailToClinics: true,
    showPhoneToClinics: true,
    showCityToClinics: true,
    allowClinicProfileAccess: true,
    showFullNamePublic: true,
    showAvatarPublic: true,
    showCityPublic: true,
  };

  if (!privacy.allowClinicProfileAccess) {
    return NextResponse.json(
      { error: "Access denied by doctor privacy settings" },
      { status: 403 }
    );
  }

  const profile = user.publicProfile;

  const displayName =
    profile?.displayName ??
    (privacy.showFullNamePublic ? user.name : null) ??
    doctor.fullName ??
    null;

  const avatarUrl =
    (privacy.showAvatarPublic ? user.avatarUrl ?? profile?.avatarUrl : null) ??
    null;

  const location = {
    country: user.country ?? profile?.country ?? null,
    city: privacy.showCityToClinics
      ? user.city ?? profile?.city ?? null
      : null,
  };

  const contact = {
    email: privacy.showEmailToClinics ? user.email ?? doctor.email : null,
    phone: privacy.showPhoneToClinics ? user.phone : null,
  };

  const visibleProfile = {
    id: user.id,
    doctorId: doctor.id,
    displayName,
    username: profile?.username ?? null,
    slug: profile?.slug ?? null,
    headline: profile?.headline ?? null,
    avatarUrl,
    coverUrl: profile?.coverUrl ?? null,
    website: profile?.website ?? null,
    socialLinks: profile?.socialLinks ?? null,
    location,
    contact,
    isPublic: profile?.isPublic ?? true,
    privacy: {
      allowClinicProfileAccess: privacy.allowClinicProfileAccess,
      showEmailToClinics: privacy.showEmailToClinics,
      showPhoneToClinics: privacy.showPhoneToClinics,
      showCityToClinics: privacy.showCityToClinics,
      showFullNamePublic: privacy.showFullNamePublic,
      showAvatarPublic: privacy.showAvatarPublic,
      showCityPublic: privacy.showCityPublic,
    },
  };

  try {
    await logSecurityEvent({
      action: "CLINIC_VIEW_DOCTOR_PUBLIC_PROFILE",
      userId: clinicId,
      targetUserId: user.id,
      details: {
        clinicId,
        doctorId: doctor.id,
      },
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ profile: visibleProfile });
}
