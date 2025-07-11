import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const clinicId = "demo-clinic-id";

  const ageGroups = [
    { label: "0-17", from: 0, to: 17 },
    { label: "18-24", from: 18, to: 24 },
    { label: "25-34", from: 25, to: 34 },
    { label: "35-44", from: 35, to: 44 },
    { label: "45-54", from: 45, to: 54 },
    { label: "55-64", from: 55, to: 64 },
    { label: "65+", from: 65, to: 120 },
  ];

  const results = await Promise.all(
    ageGroups.map(async ({ label, from, to }) => {
      const fromDate = new Date();
      const toDate = new Date();
      fromDate.setFullYear(fromDate.getFullYear() - to);
      toDate.setFullYear(toDate.getFullYear() - from);

      const male = await prisma.clinicPatient.count({
        where: {
          clinicId,
          gender: "male",
          birthDate: { gte: fromDate, lte: toDate },
        },
      });

      const female = await prisma.clinicPatient.count({
        where: {
          clinicId,
          gender: "female",
          birthDate: { gte: fromDate, lte: toDate },
        },
      });

      return { ageGroup: label, male, female };
    })
  );

  return NextResponse.json(results);
}
