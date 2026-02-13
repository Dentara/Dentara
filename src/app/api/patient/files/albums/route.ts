// app/api/patient/files/albums/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Forbidden", { status: 403 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const albums = await prisma.patientAlbum.findMany({
    where: { patientUserId: user.id },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ albums });
}
