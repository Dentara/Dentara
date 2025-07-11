import { prisma } from "@/app/libs/prismaDB";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/app/libs/email";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 saat

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "patient",
        verificationToken,
        tokenExpires,
        emailConfirmed: false,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: "Account created. Please verify your email." });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
