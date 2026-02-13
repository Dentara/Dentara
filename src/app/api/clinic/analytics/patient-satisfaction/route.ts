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

  // Son 30 gün daxilində status paylanması
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [completed, confirmed, scheduled, rescheduled, cancelled, noshow] = await Promise.all([
    prisma.appointment.count({ where: { clinicId, status: "Completed",  createdAt: { gte: since } } }),
    prisma.appointment.count({ where: { clinicId, status: "Confirmed",  createdAt: { gte: since } } }),
    prisma.appointment.count({ where: { clinicId, status: "Scheduled",  createdAt: { gte: since } } }),
    prisma.appointment.count({ where: { clinicId, status: "Rescheduled",createdAt: { gte: since } } }),
    prisma.appointment.count({ where: { clinicId, status: "Cancelled",  createdAt: { gte: since } } }),
    prisma.appointment.count({ where: { clinicId, status: "No-Show",    createdAt: { gte: since } } }),
  ]);

  const total = completed + confirmed + scheduled + rescheduled + cancelled + noshow;

  // Proksi xəritə:
  // Completed → Very Satisfied
  // Confirmed → Satisfied
  // Scheduled/Rescheduled → Neutral
  // Cancelled → Dissatisfied
  // No-Show → Very Dissatisfied
  const dist = total > 0 ? [
    { title: "Very Satisfied",     value: (completed / total) * 100 },
    { title: "Satisfied",          value: (confirmed / total) * 100 },
    { title: "Neutral",            value: ((scheduled + rescheduled) / total) * 100 },
    { title: "Dissatisfied",       value: (cancelled / total) * 100 },
    { title: "Very Dissatisfied",  value: (noshow / total) * 100 },
  ] : [
    { title: "Very Satisfied",     value: 0 },
    { title: "Satisfied",          value: 0 },
    { title: "Neutral",            value: 0 },
    { title: "Dissatisfied",       value: 0 },
    { title: "Very Dissatisfied",  value: 0 },
  ];

  // Yuvarlaqla (vizual daha səliqəli olsun)
  const rounded = dist.map(d => ({ title: d.title, value: Math.round(d.value) }));

  return NextResponse.json(rounded);
}
