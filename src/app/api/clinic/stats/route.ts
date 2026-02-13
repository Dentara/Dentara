import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user: any = session?.user;
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // clinic hesabı → clinicId = user.id
    // doctor hesabı üçün ClinicDoctor əlaqəsindən də götürmək olar (indilik clinic hesabı kifayətdir)
    const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
    if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

    const now = new Date();
    const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLast = new Date(now.getFullYear(), now.getMonth(), 0);

    const [sumThis, sumLast] = await Promise.all([
      prisma.billing.aggregate({ _sum: { amount: true }, where: { clinicId, createdAt: { gte: startThis } } }),
      prisma.billing.aggregate({ _sum: { amount: true }, where: { clinicId, createdAt: { gte: startLast, lte: endLast } } }),
    ]);

    const [patientsThis, patientsLast] = await Promise.all([
      prisma.clinicPatient.count({ where: { clinicId, createdAt: { gte: startThis } } }),
      prisma.clinicPatient.count({ where: { clinicId, createdAt: { gte: startLast, lte: endLast } } }),
    ]);

    const [staffThis, staffLast] = await Promise.all([
      prisma.clinicDoctor.count({ where: { clinicId, joinedAt: { gte: startThis } } }),
      prisma.clinicDoctor.count({ where: { clinicId, joinedAt: { gte: startLast, lte: endLast } } }),
    ]);

    const [apptThis, apptLast] = await Promise.all([
      prisma.appointment.count({ where: { clinicId, createdAt: { gte: startThis } } }),
      prisma.appointment.count({ where: { clinicId, createdAt: { gte: startLast, lte: endLast } } }),
    ]);

    const revenue = sumThis._sum.amount ?? 0;
    const lastRevenue = sumLast._sum.amount ?? 0;
    const pct = (cur: number, prev: number) =>
      prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0;

    return NextResponse.json({
      revenue,
      revenueChange: pct(revenue, lastRevenue),
      patients: patientsThis,
      patientsChange: patientsLast > 0 ? ((patientsThis - patientsLast) / patientsLast) * 100 : (patientsThis > 0 ? 100 : 0),
      staff: staffThis,
      staffChange: staffThis - staffLast, // UI “new this month” kimi göstərir
      appointments: apptThis,
      appointmentsChange: apptLast > 0 ? ((apptThis - apptLast) / apptLast) * 100 : (apptThis > 0 ? 100 : 0),
    });
  } catch (e) {
    console.error("GET /api/clinic/stats", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
