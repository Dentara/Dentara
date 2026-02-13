// app/api/link/patient/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const clinicId =
      role === "clinic"
        ? ((session.user as any).id as string)
        : ((session.user as any).clinicId as string | undefined);

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic context missing" }, { status: 400 });
    }

    const body = await req.json();
    const { clinicPatientId, email } = body as { clinicPatientId?: string; email?: string };
    if (!clinicPatientId && !email) {
      return NextResponse.json({ error: "clinicPatientId or email required" }, { status: 400 });
    }

    // 1) ClinicPatient tap
    const cp = await prisma.clinicPatient.findFirst({
      where: clinicPatientId ? { id: clinicPatientId, clinicId } : { clinicId, email: email?.toLowerCase() },
      select: { id: true, clinicId: true, email: true },
    });
    if (!cp) return NextResponse.json({ error: "ClinicPatient not found" }, { status: 404 });

    // 2) User tap
    const targetEmail = (email || cp.email || "").toLowerCase();
    if (!targetEmail) return NextResponse.json({ error: "No email to link" }, { status: 400 });
    const user = await prisma.user.findFirst({
      where: { email: targetEmail },
      select: { id: true, role: true, email: true },
    });
    if (!user) return NextResponse.json({ error: "User not found for this email" }, { status: 404 });

    // 3) Link yaz (ClinicPatient.userId)
    const updated = await prisma.clinicPatient.update({
      where: { id: cp.id },
      data: { userId: user.id },
      select: { id: true, userId: true },
    });

    return NextResponse.json({ ok: true, linkId: updated.id });
  } catch (e: any) {
    console.error("link/patient error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
