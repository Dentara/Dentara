import { prisma } from "@/app/libs/prismaDB";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Missing token." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      tokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailConfirmed: true,
      verificationToken: null,
      tokenExpires: null,
    },
  });

  return NextResponse.json({ message: "Email successfully verified." });
}
