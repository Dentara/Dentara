import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const clinicId = "demo-clinic-id"; // Sonra sessiyadan götürüləcək

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Cari və keçən ayın maliyyə göstəriciləri
    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.billing.aggregate({
        _sum: { amount: true },
        where: {
          clinicId,
          createdAt: { gte: startOfThisMonth },
        },
      }),
      prisma.billing.aggregate({
        _sum: { amount: true },
        where: {
          clinicId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ]);

    const [thisMonthAppointments, lastMonthAppointments] = await Promise.all([
      prisma.appointment.count({
        where: { clinicId, createdAt: { gte: startOfThisMonth } },
      }),
      prisma.appointment.count({
        where: { clinicId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
    ]);

    const [thisMonthPatients, lastMonthPatients] = await Promise.all([
      prisma.clinicPatient.count({
        where: { clinicId, createdAt: { gte: startOfThisMonth } },
      }),
      prisma.clinicPatient.count({
        where: { clinicId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
    ]);

    const [thisMonthStaff, lastMonthStaff] = await Promise.all([
      prisma.clinicDoctor.count({
        where: {
          clinicId,
          role: "DOCTOR", // əgər enum StaffRole istifadə edirsənsə
          joinedAt: { gte: startOfThisMonth },
        },
      }),
      prisma.clinicDoctor.count({
        where: {
          clinicId,
          role: "DOCTOR",
          joinedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ]);


    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return NextResponse.json({
      revenue: thisMonthRevenue._sum.amount || 0,
      revenueChange: calcChange(thisMonthRevenue._sum.amount ?? 0, lastMonthRevenue._sum.amount ?? 0),
      appointments: thisMonthAppointments,
      appointmentsChange: calcChange(thisMonthAppointments, lastMonthAppointments),
      patients: thisMonthPatients,
      patientsChange: calcChange(thisMonthPatients, lastMonthPatients),
      staff: thisMonthStaff,
      staffChange: thisMonthStaff - lastMonthStaff,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
