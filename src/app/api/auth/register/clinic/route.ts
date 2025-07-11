import { prisma } from "@/app/libs/prismaDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { sendVerificationEmail } from "@/app/libs/email";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const license = formData.get("license") as File;

    if (!name || !email || !password || !license) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "clinics");
    await mkdir(uploadsDir, { recursive: true });

    const licenseBuffer = Buffer.from(await license.arrayBuffer());
    const licenseFileName = `license_${Date.now()}_${license.name}`;
    await writeFile(path.join(uploadsDir, licenseFileName), licenseBuffer);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // 1. Add user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "clinic",
        status: "pending",
        emailConfirmed: false,
        verificationToken,
        tokenExpires,
      },
    });

    // 2. Add clinic
    await prisma.clinic.create({
      data: {
        id: user.id, // Use same ID as user
        name,
        email,
        phone,
        address,
        licenseFile: `/uploads/clinics/${licenseFileName}`,
        createdAt: new Date(),
      },
    });

    // 3. Create clinic-doctor link
    await prisma.clinicDoctor.create({
      data: {
        clinicId: user.id,  // same ID as above
        userId: user.id,
        role: "admin",
        joinedAt: new Date()
      }
    });

    // 4. Send email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register clinic error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
