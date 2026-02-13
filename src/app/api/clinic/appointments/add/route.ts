import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type CreateBody = {
  patientId: string;
  doctorId: string;
  date: string;           // "YYYY-MM-DD"
  time: string;           // "HH:MM" və ya "HH:MM AM/PM"
  status?: string;        // default: "Scheduled"
  type?: string;
  duration?: number;      // dəqiqə
  department?: string;
  toothNumber?: string;
  procedureType?: string;
  price?: number;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user: any = session?.user;
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
    if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

    const body = (await req.json()) as CreateBody;

    // Minimal validasiya
    if (!body.patientId || !body.doctorId || !body.date || !body.time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Həkim və pasiyentin həmin klinikaya məxsusluğunu yoxla
    const [docOk, patOk] = await Promise.all([
      prisma.doctor.count({ where: { id: body.doctorId, clinicId } }),
      prisma.clinicPatient.count({ where: { id: body.patientId, clinicId } }),
    ]);
    if (!docOk) return NextResponse.json({ error: "Doctor not in clinic" }, { status: 403 });
    if (!patOk) return NextResponse.json({ error: "Patient not in clinic" }, { status: 403 });

    const created = await prisma.appointment.create({
      data: {
        clinicId,
        patientId: body.patientId,
        doctorId: body.doctorId,
        date: body.date,
        time: body.time,
        status: body.status || "Scheduled",
        type: body.type || null,
        duration: typeof body.duration === "number" ? body.duration : 0,
        department: body.department || null,
        toothNumber: body.toothNumber || null,
        procedureType: body.procedureType || null,
        price: typeof body.price === "number" ? body.price : 0,
      },
      include: {
        patient: { select: { name: true, image: true } },
        doctor:  { select: { fullName: true } },
      },
    });

    return NextResponse.json(created);
  } catch (e) {
    console.error("POST /api/clinic/appointments/add error:", e);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
