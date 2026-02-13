// app/api/clinic/portal/doctors/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * Clinic paneli üçün DOCTOR portal status listi.
 * Mövcud /api/doctors endpointinə toxunmadan status qaytarır:
 *  - linked  : ClinicDoctor.userId mövcuddur
 *  - pending : user hesabı var (User.email = Doctor.email), amma hələ link edilməyib
 *  - none    : heç nə yoxdur
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // clinic konteksti
    const role = (session.user as any).role;
    const clinicId =
      role === "clinic"
        ? ((session.user as any).id as string) // clinic account → user.id = clinicId (sənin qaydana uyğun)
        : ((session.user as any).clinicId as string | undefined);

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic context missing" }, { status: 400 });
    }

    // 1) Klinikanın doctor-ları
    const doctors = await prisma.doctor.findMany({
      where: { clinicId },
      select: {
        id: true,
        clinicId: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (doctors.length === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    // 2) ClinicDoctor bağlantıları (userId varsa "linked")
    const clinicDoctorLinks = await prisma.clinicDoctor.findMany({
      where: { clinicId, doctorId: { in: doctors.map((d) => d.id) } },
      select: { id: true, doctorId: true, userId: true, role: true },
    });
    const linkByDoctorId = new Map(
      clinicDoctorLinks.map((x) => [x.doctorId, { userId: x.userId, role: x.role }]),
    );

    // 3) User hesablarının e-mail ilə yoxlanması (pending üçün)
    const emails = doctors.map((d) => d.email).filter(Boolean) as string[];
    const uniqueEmails = Array.from(new Set(emails));
    const usersByEmail = uniqueEmails.length
      ? await prisma.user.findMany({
          where: { email: { in: uniqueEmails } },
          select: { id: true, email: true, role: true },
        })
      : [];
    const userEmailSet = new Set(usersByEmail.map((u) => (u.email || "").toLowerCase()));

    // 4) Status hesabla
    const items = doctors.map((d) => {
      const link = linkByDoctorId.get(d.id);
      let portalStatus: "linked" | "pending" | "none" = "none";
      if (link?.userId) portalStatus = "linked";
      else if (d.email && userEmailSet.has(d.email.toLowerCase())) portalStatus = "pending";

      return {
        id: d.id,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        createdAt: d.createdAt,
        portalStatus,
        role: link?.role ?? null,
      };
    });

    return NextResponse.json({ items, count: items.length });
  } catch (err: any) {
    console.error("portal/doctors GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
