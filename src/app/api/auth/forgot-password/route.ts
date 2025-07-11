import { prisma } from "@/app/libs/prismaDB";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/app/libs/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "No user with this email." }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 15); // 15 dəqiqəlik token

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token, expiresAt: tokenExpiry },
      create: {
        userId: user.id,
        token,
        expiresAt: tokenExpiry,
      },
    });

    const resetLink = `${process.env.SITE_URL}/auth/reset-password/${token}`;

    await sendResetPasswordEmail(email, resetLink);

    return NextResponse.json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return NextResponse.json({ message: "Server error. Please try again." }, { status: 500 });
  }
}
