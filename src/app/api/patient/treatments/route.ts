// app/api/patient/treatments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function parseDate(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (role !== "patient" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const from = parseDate(url.searchParams.get("from"));
  const to = parseDate(url.searchParams.get("to"));

  // PatientUserId → öz tarixçəsi
  const meUserId = (session.user as any).id as string;

  const where: any = {
    patientUserId: meUserId,
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { procedureCode: { contains: q, mode: "insensitive" } },
            { procedureName: { contains: q, mode: "insensitive" } },
            { notes: { contains: q, mode: "insensitive" } },
            { clinic: { name: { contains: q, mode: "insensitive" } } },
            { doctor: { fullName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const items = await prisma.treatmentEntry.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      clinic: { select: { id: true, name: true } },
      doctor: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
      teeth: true,
      attachments: {
        include: {
          patientFile: { select: { id: true, name: true, url: true, scope: true, thumbnail: true } },
        },
      },
    },
  });

  return NextResponse.json({ items });
}
