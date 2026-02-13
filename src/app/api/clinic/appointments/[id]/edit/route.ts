import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type EditableFields = {
  date?: string;
  time?: string;
  status?: string;
  type?: string;
  duration?: number;
  department?: string;
  toothNumber?: string;
  procedureType?: string;
  price?: number;
};

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user: any = session?.user;
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
    if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

    const id = params.id;

    const body = (await req.json()) as EditableFields;

    // Bu təyinat həqiqətən bu klinikaya məxsusdurmu?
    const appt = await prisma.appointment.findUnique({
      where: { id },
      select: { clinicId: true },
    });
    if (!appt || appt.clinicId !== clinicId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Yalnız icazə verilən sahələri yenilə
    const data: EditableFields = {};
    const keys: (keyof EditableFields)[] = [
      "date","time","status","type","duration","department","toothNumber","procedureType","price"
    ];
    for (const k of keys) {
      if (typeof body[k] !== "undefined") (data as any)[k] = body[k];
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { name: true, image: true } },
        doctor:  { select: { fullName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/clinic/appointments/[id]/edit error:", e);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
