import { prisma } from "@/app/libs/prismaDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/app/libs/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, phone } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 saat

    await prisma.user.create({
      data: {
        fullname: fullName,
        email,
        password: hashedPassword,
        phone,
        role: "patient",
        status: "pending",
        emailConfirmed: false,
        verificationToken,
        tokenExpires,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "Server error while registering" },
      { status: 500 }
    );
  }
}
