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
 * Klinikadan baxanda pasiyent public profilini qaytarır.
 *
 * Path-id həm Patient.id, həm də ClinicPatient.id ola bilər:
 * 1) Əvvəl ClinicPatient.id + clinicId ilə axtarırıq
 * 2) Tapmasa patientGlobalId = id
 * 3) Tapmasa patientUserId = id
 *
 * Yalnız əlaqəli (ACTIVE və ya INVITED) ClinicPatient varsa icazə veririk.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;

  if (!u?.id || u.role !== "clinic") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const clinicId = u.id as string;

  // 1) ClinicPatient tap: id, patientGlobalId və ya patientUserId ilə
  const membership = await prisma.clinicPatient.findFirst({
    where: {
      clinicId,
      OR: [
        { id }, // birbaşa membership id
        { patientGlobalId: id },
        { patientUserId: id },
      ],
    },
    select: {
      id: true,
      status: true,
      patientUserId: true,
      patientGlobalId: true,
    },
  });

  if (!membership) {
    // Klinikanın bu pasiyentlə heç bir membership-i yoxdur
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Gələcəkdə status filter (ACTIVE-only) etmək istəsən, burada yoxlaya bilərik
  // if (membership.status !== "ACTIVE") { ... }

  let patientUserId: string | null = membership.patientUserId;

  // Əgər userId yoxdur, patientGlobalId → Patient.email → User.id yolu ilə tapmağa çalışaq
  if (!patientUserId && membership.patientGlobalId) {
    const patient = await prisma.patient.findUnique({
      where: { id: membership.patientGlobalId },
      select: { email: true },
    });

    if (patient?.email) {
      const user = await prisma.user.findFirst({
        where: { email: patient.email },
        select: { id: true },
      });
      if (user) {
        patientUserId = user.id;
      }
    }
  }

  if (!patientUserId) {
    return NextResponse.json(
      { error: "Patient account is not linked to a user" },
      { status: 404 }
    );
  }

  // User + PublicProfile + PrivacySettings
  const user = await prisma.user.findUnique({
    where: { id: patientUserId },
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
    showCityPublic: false,
  };

  if (!privacy.allowClinicProfileAccess) {
    return NextResponse.json(
      { error: "Access denied by patient privacy settings" },
      { status: 403 }
    );
  }

  const profile = user.publicProfile;

  const displayName =
    profile?.displayName ??
    (privacy.showFullNamePublic ? user.name : null) ??
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
    email: privacy.showEmailToClinics ? user.email : null,
    phone: privacy.showPhoneToClinics ? user.phone : null,
  };

  const visibleProfile = {
    id: user.id,
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
      action: "CLINIC_VIEW_PATIENT_PUBLIC_PROFILE",
      userId: clinicId,
      targetUserId: user.id,
      details: {
        clinicId,
        membershipId: membership.id,
      },
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ profile: visibleProfile });
}
