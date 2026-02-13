import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user: any = session?.user;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
  if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

  const ageGroups = [
    { label: "0-17", from: 0, to: 17 },
    { label: "18-24", from: 18, to: 24 },
    { label: "25-34", from: 25, to: 34 },
    { label: "35-44", from: 35, to: 44 },
    { label: "45-54", from: 45, to: 54 },
    { label: "55-64", from: 55, to: 64 },
    { label: "65+", from: 65, to: 120 },
  ];

  const now = new Date();

  const makeDateByAge = (years: number) =>
    new Date(now.getFullYear() - years, now.getMonth(), now.getDate());

  const results = await Promise.all(
    ageGroups.map(async ({ label, from, to }) => {
      const toDate = makeDateByAge(from); // younger bound → more recent birth
      const fromDate = makeDateByAge(to); // older bound → earlier birth

      const male = await prisma.clinicPatient.count({
        where: { clinicId, gender: "male", birthDate: { gte: fromDate, lte: toDate } },
      });

      const female = await prisma.clinicPatient.count({
        where: { clinicId, gender: "female", birthDate: { gte: fromDate, lte: toDate } },
      });

      return { ageGroup: label, male, female };
    })
  );

  return NextResponse.json(results);
}
