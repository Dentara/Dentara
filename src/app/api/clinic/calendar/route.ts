import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function to24h(hhmm: string) {
  // "10:00" və ya "10:00 AM/PM" → "HH:MM" (24h)
  const s = hhmm.trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!m) return s;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function addMinutes(hhmm24: string, minutes: number) {
  const [h, m] = hhmm24.split(":").map(Number);
  const total = h * 60 + m + (minutes || 0);
  const H = Math.floor((total % (24 * 60) + 24 * 60) % (24 * 60) / 60);
  const M = ((total % 60) + 60) % 60;
  return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const doctor = url.searchParams.get("doctor") || "all";
  const from = url.searchParams.get("from") || "";
  const to   = url.searchParams.get("to")   || "";

  const session = await getServerSession(authOptions);
  const user: any = session?.user;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
  if (!clinicId) return NextResponse.json({ error: "No clinicId bound" }, { status: 403 });

  // Date aralığı: verilməyibsə, default → bu gün ± 7 gün
  let whereDate: any = {};
  if (from && to) {
    whereDate = { gte: from, lte: to };          // appointment.date string: "YYYY-MM-DD"
  } else {
    const today = new Date();
    const start = new Date(today); start.setDate(start.getDate() - 7);
    const end   = new Date(today); end.setDate(end.getDate() + 7);
    const ymd = (d: Date) => d.toISOString().split("T")[0];
    whereDate = { gte: ymd(start), lte: ymd(end) };
  }

  const where: any = { clinicId, date: whereDate };
  if (doctor && doctor !== "all") where.doctorId = doctor;

  const items = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { name: true, image: true } },
      doctor:  { select: { fullName: true, id: true } },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const mapped = items.map((a) => {
    const start24 = to24h(a.time || "00:00");
    const end24 = addMinutes(start24, a.duration || 0);
    return {
      id: a.id,
      patient: { name: a.patient?.name || "Unknown", image: a.patient?.image || null },
      doctor: { fullName: a.doctor?.fullName || "Unknown", id: a.doctor?.id || null },
      date: a.date,               // "YYYY-MM-DD"
      startTime: start24,         // "HH:MM" 24h → Calendar grid ilə uyğun
      endTime: end24,             // "HH:MM" 24h
      status: a.status,
      type: a.type,
      duration: a.duration,
      department: a.department,
      // rəng, s. gələcəkdə əlavə oluna bilər
    };
  });

  return NextResponse.json(mapped);
}
