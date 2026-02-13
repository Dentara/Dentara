// app/api/clinic/portal/patients/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * Clinic paneli üçün PATIENT portal status listi.
 * Mövcud /api/patients endpointinə toxunmadan:
 *  - linked  : ClinicPatient.userId mövcuddur
 *  - pending : user hesabı var (User.email = ClinicPatient.email), amma hələ link edilməyib
 *  - none    : heç nə yoxdur
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const clinicId =
      role === "clinic"
        ? ((session.user as any).id as string)
        : ((session.user as any).clinicId as string | undefined);

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic context missing" }, { status: 400 });
    }

    // 1) Klinikanın ClinicPatient qeydləri
    const cps = await prisma.clinicPatient.findMany({
      where: { clinicId },
      select: {
        id: true,
        clinicId: true,
        fullName: true,
        email: true,
        phone: true,
        userId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (cps.length === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    // 2) User hesablarının e-mail ilə yoxlanması (pending üçün)
    const emails = cps.map((p) => p.email).filter(Boolean) as string[];
    const uniqueEmails = Array.from(new Set(emails));
    const usersByEmail = uniqueEmails.length
      ? await prisma.user.findMany({
          where: { email: { in: uniqueEmails } },
          select: { id: true, email: true, role: true },
        })
      : [];
    const userEmailSet = new Set(usersByEmail.map((u) => (u.email || "").toLowerCase()));

    // 3) Status
    const items = cps.map((p) => {
      let portalStatus: "linked" | "pending" | "none" = "none";
      if (p.userId) portalStatus = "linked";
      else if (p.email && userEmailSet.has(p.email.toLowerCase())) portalStatus = "pending";

      return {
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        createdAt: p.createdAt,
        portalStatus,
      };
    });

    return NextResponse.json({ items, count: items.length });
  } catch (err: any) {
    console.error("portal/patients GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
