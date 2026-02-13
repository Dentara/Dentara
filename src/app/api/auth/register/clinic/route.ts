// app/api/auth/register/clinic/route.ts
export const runtime = "nodejs";

import { prisma } from "@/app/libs/prismaDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { sendVerificationEmail } from "@/app/libs/email";
import { verifyHCaptchaToken } from "@/lib/hcaptcha";
import { logRegistrationAttempt } from "@/lib/registrationAudit";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import { validatePassword, PASSWORD_POLICY_MESSAGE } from "@/lib/passwordPolicy";
import { logSecurityEvent } from "@/lib/securityLog";

export async function POST(req: Request) {
  let email = "";
  try {
    const formData = await req.formData();

    const name = (formData.get("name") as string) || "";
    email = ((formData.get("email") as string) || "").toLowerCase().trim();
    const password = (formData.get("password") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const address = (formData.get("address") as string) || "";
    const country = (formData.get("country") as string) || "";
    const city = (formData.get("city") as string) || "";
    const license = formData.get("license") as File;
    const captchaToken = (formData.get("captchaToken") as string) || "";

    if (!name || !email || !password || !license) {
      await logRegistrationAttempt({
        role: "clinic",
        email,
        success: false,
        error: "missing_fields",
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.ok) {
      await logRegistrationAttempt({
        role: "clinic",
        email,
        success: false,
        error: "weak_password",
      });
      return NextResponse.json(
        { error: pwdCheck.message || PASSWORD_POLICY_MESSAGE },
        { status: 400 }
      );
    }

    if (!captchaToken) {
      await logRegistrationAttempt({
        role: "clinic",
        email,
        success: false,
        error: "missing_captcha",
      });
      return NextResponse.json({ error: "Captcha is required" }, { status: 400 });
    }

    // Rate limit: eyni email üçün 10 dəq ərzində max 5 cəhd
    const rl = checkRateLimit({
      key: `register:clinic:${email}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.allowed) {
      await logRegistrationAttempt({
        role: "clinic",
        email,
        success: false,
        error: "rate_limited",
      });
      return NextResponse.json(
        {
          error:
            "Too many registration attempts. Please wait a few minutes and try again.",
        },
        { status: 429 }
      );
    }

    const hdrs = await headers();
    const remoteIp =
      hdrs.get("x-forwarded-for") ||
      hdrs.get("x-real-ip") ||
      hdrs.get("cf-connecting-ip") ||
      undefined;

    const captchaResult = await verifyHCaptchaToken(captchaToken, remoteIp || undefined);
    if (!captchaResult.ok) {
      await logRegistrationAttempt({
        role: "clinic",
        email,
        success: false,
        error: `captcha_failed: ${captchaResult.reason}`,
      });
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await logRegistrationAttempt({
        role: "clinic",
        email,
        success: false,
        error: "email_exists",
      });
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

    // 1. User
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
        country: country || null,
        city: city || null,
      },
    });

    // 2. Clinic
    await prisma.clinic.create({
      data: {
        id: user.id, // User ilə eyni ID
        name,
        email,
        phone,
        address,
        licenseFile: `/uploads/clinics/${licenseFileName}`,
        createdAt: new Date(),
        country: country || null,
        city: city || null,
      },
    });

    // 3. Clinic-doctor link (owner kimi)
    await prisma.clinicDoctor.create({
      data: {
        clinicId: user.id,
        userId: user.id,
        role: "admin",
        joinedAt: new Date(),
      },
    });

    // 4. Email
    await sendVerificationEmail(email, verificationToken);

    await logRegistrationAttempt({
      role: "clinic",
      email,
      success: true,
      meta: { userId: user.id, country, city },
    });
    await logSecurityEvent({
      action: "REGISTER_SUCCESS_CLINIC",
      userId: user.id,
      email,
      details: { country, city },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await logRegistrationAttempt({
      role: "clinic",
      email,
      success: false,
      error: error?.message || "server_error",
    });

    console.error("Register clinic error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
