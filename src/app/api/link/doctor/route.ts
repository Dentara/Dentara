// app/api/link/doctor/route.ts
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
    const { doctorId, email } = body as { doctorId?: string; email?: string };
    if (!doctorId && !email) {
      return NextResponse.json({ error: "doctorId or email required" }, { status: 400 });
    }

    // 1) Hədəf doctor-u tap
    const doctor = await prisma.doctor.findFirst({
      where: doctorId ? { id: doctorId, clinicId } : { clinicId, email: email?.toLowerCase() },
      select: { id: true, clinicId: true, email: true },
    });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    // 2) E-mail ilə user tap
    const targetEmail = (email || doctor.email || "").toLowerCase();
    if (!targetEmail) {
      return NextResponse.json({ error: "No email to link" }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: { email: targetEmail },
      select: { id: true, role: true, email: true },
    });
    if (!user) return NextResponse.json({ error: "User not found for this email" }, { status: 404 });

    // 3) ClinicDoctor yaz (əgər mövcuddursa update)
    const cd = await prisma.clinicDoctor.upsert({
      where: {
        // unique key varsa ona uyğun yaz; yoxdursa compound axtarış et
        // burada upsert üçün fake unique lazım ola bilər → əgər yoxdursa firstOrThrow + update edin
        // sadə yol: əvvəl findFirst, sonra create/update:
        id: "___invalid___", // upsert hack; aşağıdakı try/catch ilə həll edəcəyik
      },
      update: {},
      create: { clinicId, doctorId: doctor.id, userId: user.id, role: "doctor" as any },
    }).catch(async () => {
      const existing = await prisma.clinicDoctor.findFirst({ where: { clinicId, doctorId: doctor.id } });
      if (existing) {
        return prisma.clinicDoctor.update({
          where: { id: existing.id },
          data: { userId: user.id },
        });
      }
      return prisma.clinicDoctor.create({
        data: { clinicId, doctorId: doctor.id, userId: user.id, role: "doctor" as any },
      });
    });

    return NextResponse.json({ ok: true, linkId: cd.id });
  } catch (e: any) {
    console.error("link/doctor error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
