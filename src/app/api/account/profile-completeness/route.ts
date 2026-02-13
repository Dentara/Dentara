// app/api/account/profile-completeness/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type Item = {
  key: string;
  label: string;
  filled: boolean;
};

type Role = "patient" | "doctor" | "clinic" | string | null;

function computeScore(items: Item[]) {
  if (!items.length) return 0;
  const filled = items.filter((i) => i.filled).length;
  return Math.round((filled / items.length) * 100);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      phone: true,
      country: true,
      city: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const role = (user.role || "patient") as Role;
  const baseItems: Item[] = [
    { key: "user.name", label: "Full name", filled: !!user.name },
    {
      key: "user.emailVerified",
      label: "Email verified",
      filled: !!user.emailVerified,
    },
    { key: "user.phone", label: "Phone number", filled: !!user.phone },
    {
      key: "user.location",
      label: "Country and city",
      filled: !!user.country && !!user.city,
    },
    {
      key: "user.avatar",
      label: "Profile photo / avatar",
      filled: !!user.avatarUrl,
    },
  ];

  let items: Item[] = [...baseItems];

  if (role === "doctor") {
    // Doctor-specific məlumatlar
    const doctor = await prisma.doctor.findFirst({
      where: { email: user.email || undefined },
      select: {
        id: true,
        fullName: true,
        specialization: true,
        profilePhoto: true,
        diplomaFile: true,
        clinicId: true,
      },
    });

    const memberships = await prisma.clinicDoctor.findMany({
      where: { userId: user.id },
      select: { id: true },
      take: 1,
    });

    const hasClinicLink = memberships.length > 0 || !!doctor?.clinicId;

    items = items.concat([
      {
        key: "doctor.fullName",
        label: "Professional name (doctor profile)",
        filled: !!doctor?.fullName,
      },
      {
        key: "doctor.specialization",
        label: "Specialization (e.g. Orthodontist)",
        filled: !!doctor?.specialization,
      },
      {
        key: "doctor.profilePhoto",
        label: "Professional photo",
        filled: !!doctor?.profilePhoto || !!user.avatarUrl,
      },
      {
        key: "doctor.diplomaFile",
        label: "Diploma document uploaded",
        filled: !!doctor?.diplomaFile,
      },
      {
        key: "doctor.clinicLink",
        label: "Linked to at least one clinic",
        filled: hasClinicLink,
      },
      {
        key: "doctor.credentials",
        label: "Credentials section completed (ID + diploma)",
        filled: !!doctor?.diplomaFile && (!!doctor?.profilePhoto || !!user.avatarUrl),
      },
    ]);
  } else if (role === "clinic") {
    // Clinic-specific məlumatlar – user.id = clinic.id kimi qurmuşduq
    let clinic = await prisma.clinic.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        country: true,
        city: true,
        licenseFile: true,
      },
    });

    if (!clinic && user.email) {
      clinic = await prisma.clinic.findFirst({
        where: { email: user.email },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          country: true,
          city: true,
          licenseFile: true,
        },
      });
    }

    const staff = await prisma.clinicDoctor.count({
      where: { clinicId: clinic?.id || user.id },
    });

    items = items.concat([
      {
        key: "clinic.name",
        label: "Clinic name",
        filled: !!clinic?.name,
      },
      {
        key: "clinic.address",
        label: "Clinic address",
        filled: !!clinic?.address,
      },
      {
        key: "clinic.location",
        label: "Clinic location (country and city)",
        filled: !!clinic?.country && !!clinic?.city,
      },
      {
        key: "clinic.licenseFile",
        label: "Clinic licence document uploaded",
        filled: !!clinic?.licenseFile,
      },
      {
        key: "clinic.staff",
        label: "At least one staff member linked",
        filled: staff > 0,
      },
    ]);
  } else {
    // patient / digər rollar üçün patient kimi davranırıq
    // gələcəkdə patient medical info sahələri əlavə olunanda buraya da itemlər əlavə edə bilərik
  }

  const score = computeScore(items);
  const missing = items.filter((i) => !i.filled);

  return NextResponse.json({
    role,
    score,
    items,
    missingCount: missing.length,
  });
}
