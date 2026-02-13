// app/api/self/join-clinic/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { notifyClinic } from "@/lib/notify";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as "doctor" | "patient" | undefined;
  const userId = (session.user as any).id as string | undefined;
  const userEmail = session.user.email ?? undefined;

  if (!role || !userId || !userEmail) {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const mode = body?.mode as "inviteCode" | "clinicEmail" | undefined;
  const inviteCode = typeof body?.inviteCode === "string" ? body.inviteCode.trim() : "";
  const clinicEmail = typeof body?.clinicEmail === "string" ? body.clinicEmail.trim() : "";

  if (!mode || (mode === "inviteCode" && !inviteCode) || (mode === "clinicEmail" && !clinicEmail)) {
    return NextResponse.json({ ok: false, error: "Required fields are missing" }, { status: 400 });
  }

  try {
    // ================= DOCTOR FLOW =================
    if (typeof role !== "undefined" && role === "doctor") {
      if (mode === "inviteCode") {
        const existing = await prisma.clinicDoctor.findFirst({
          where: { inviteCode, status: "INVITED" },
        });

        if (!existing) {
          return NextResponse.json({ ok: false, error: "Invite not found or already used" }, { status: 404 });
        }
        if (existing.inviteExpiresAt && existing.inviteExpiresAt < new Date()) {
          return NextResponse.json({ ok: false, error: "Invite expired" }, { status: 410 });
        }

        const updated = await prisma.clinicDoctor.update({
          where: { id: existing.id },
          data: {
            userId,
            email: userEmail,
            status: "ACTIVE",
            inviteCode: null,
            inviteToken: null,
            inviteExpiresAt: null,
          },
          include: { clinic: { select: { id: true, name: true, email: true } } },
        });

        return NextResponse.json({
          ok: true,
          joinedAs: "doctor",
          status: updated.status,
          clinic: updated.clinic,
        });
      }

      // mode === "clinicEmail"
      const clinic = await prisma.clinic.findFirst({
        where: { email: clinicEmail },
        select: { id: true, name: true, email: true },
      });

      if (!clinic) {
        return NextResponse.json({ ok: false, error: "Clinic not found by email" }, { status: 404 });
      }

      const existing = await prisma.clinicDoctor.findFirst({
        where: { clinicId: clinic.id, email: userEmail },
        select: { id: true },
      });

      const upserted = await prisma.clinicDoctor.upsert({
        where: { id: existing?.id ?? "___force_upsert___" },
        update: {
          userId,
          status: "INVITED",
        },
        create: {
          clinicId: clinic.id,
          userId,
          email: userEmail,
          role: "DOCTOR",
          status: "INVITED",
        },
        include: { clinic: { select: { id: true, name: true, email: true } } },
      });

      return NextResponse.json({
        ok: true,
        joinedAs: "doctor",
        status: upserted.status,
        clinic: upserted.clinic,
      });
    }

    // ================= PATIENT FLOW =================
    if (role === "patient") {
      const patientFullName =
        (typeof (session.user as any).name === "string" && (session.user as any).name?.trim()) ||
        userEmail;

      if (mode === "inviteCode") {
        const existing = await prisma.clinicPatient.findFirst({
          where: { inviteCode, status: "INVITED" },
        });

        if (!existing) {
          return NextResponse.json({ ok: false, error: "Invite not found or already used" }, { status: 404 });
        }
        if (existing.inviteExpiresAt && existing.inviteExpiresAt < new Date()) {
          return NextResponse.json({ ok: false, error: "Invite expired" }, { status: 410 });
        }

        const updated = await prisma.clinicPatient.update({
          where: { id: existing.id },
          data: {
            patientUserId: userId,
            email: userEmail,
            fullName: patientFullName,
            status: "ACTIVE",
            inviteCode: null,
            inviteToken: null,
            inviteExpiresAt: null,
          },
          include: { clinic: { select: { id: true, name: true, email: true } } },
        });

        return NextResponse.json({
          ok: true,
          joinedAs: "patient",
          status: updated.status,
          clinic: updated.clinic,
        });
      }

      // mode === "clinicEmail"
      const clinic = await prisma.clinic.findFirst({
        where: { email: clinicEmail },
        select: { id: true, name: true, email: true },
      });

      if (!clinic) {
        return NextResponse.json({ ok: false, error: "Clinic not found by email" }, { status: 404 });
      }

      const existing = await prisma.clinicPatient.findFirst({
        where: { clinicId: clinic.id, email: userEmail },
        select: { id: true },
      });

      const upserted = await prisma.clinicPatient.upsert({
        where: { id: existing?.id ?? "___force_upsert___" },
        update: {
          patientUserId: userId,
          email: userEmail,
          fullName: patientFullName,
          status: "INVITED",
        },
        create: {
          clinicId: clinic.id,
          patientUserId: userId,
          email: userEmail,
          fullName: patientFullName,
          status: "INVITED",
        },
        include: { clinic: { select: { id: true, name: true, email: true } } },
      });

      // 🔔 Notification – reusable helper
      await notifyClinic({
        clinicId: clinic.id,
        userId,
        type: "PATIENT_JOIN_REQUEST",
        payload: {
          clinicPatientId: upserted.id,
          patientEmail: userEmail,
          patientName: patientFullName,
        },
      });

      return NextResponse.json({
        ok: true,
        joinedAs: "patient",
        status: upserted.status,
        clinic: upserted.clinic,
      });
    }

    return NextResponse.json({ ok: false, error: "Unsupported role" }, { status: 400 });
  } catch (err) {
    console.error("[JOIN_CLINIC_POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
