import { prisma } from "@/app/libs/prismaDB";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
    }

    const hashed = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password successfully updated." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
