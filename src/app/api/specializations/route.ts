import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const specs = await prisma.specialization.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      department: true,
      status: true,
      doctors: true,
    }
  });
  const data = specs.map(spec => ({
    ...spec,
    doctorsCount: spec.doctors?.length ?? 0
  }));
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { specializations } = await req.json();
  if (!Array.isArray(specializations)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  // Prevent duplicate: only add those not already in DB
  for (const spec of specializations) {
    const exists = await prisma.specialization.findFirst({ where: { name: spec.name } });
    if (!exists) {
      await prisma.specialization.create({
        data: {
          name: spec.name,
          description: spec.description,
          department: spec.department,
          status: "Active"
        }
      });
    }
  }
  return NextResponse.json({ ok: true });
}
