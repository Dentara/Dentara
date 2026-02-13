// app/api/auth/register/doctor/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import prisma from "@/lib/prisma";
import { sendMailViaProjectHelper } from "@/app/libs/email-bridge";
import { verifyHCaptchaToken } from "@/lib/hcaptcha";
import { logRegistrationAttempt } from "@/lib/registrationAudit";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import { validatePassword, PASSWORD_POLICY_MESSAGE } from "@/lib/passwordPolicy";
import { logSecurityEvent } from "@/lib/securityLog";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

async function saveFileToUploads(file: File, subdir: string) {
  const buf = Buffer.from(await file.arrayBuffer());
  const safe = (file.name || `upload_${Date.now()}`).replace(/[^\w.\-]+/g, "_").slice(0, 160);
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.mkdir(dir, { recursive: true });
  const abs = path.join(dir, `${Date.now()}_${safe}`);
  await fs.writeFile(abs, buf);
  return abs.split(path.join(process.cwd(), "public")).pop()!.replace(/\\/g, "/");
}

export async function POST(req: Request) {
  let email = "";
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Multipart form-data expected" }, { status: 400 });
    }

    const form = await req.formData();
    const fullName = String(form.get("fullName") || "").trim();
    email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const phone = String(form.get("phone") || "");
    const country = String(form.get("country") || "");
    const city = String(form.get("city") || "");
    const captchaToken = String(form.get("captchaToken") || "");

    if (!fullName || !email || !password) {
      await logRegistrationAttempt({
        role: "doctor",
        email,
        success: false,
        error: "missing_fields",
      });
      return NextResponse.json(
        { error: "fullName, email, password are required" },
        { status: 400 }
      );
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.ok) {
      await logRegistrationAttempt({
        role: "doctor",
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
        role: "doctor",
        email,
        success: false,
        error: "missing_captcha",
      });
      return NextResponse.json({ error: "Captcha is required" }, { status: 400 });
    }

    // Rate limit: eyni email üçün 10 dəq ərzində max 5 cəhd
    const rl = checkRateLimit({
      key: `register:doctor:${email}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.allowed) {
      await logRegistrationAttempt({
        role: "doctor",
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
        role: "doctor",
        email,
        success: false,
        error: `captcha_failed: ${captchaResult.reason}`,
      });
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    // DUPLICATE CHECK — 409 qaytar
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await logRegistrationAttempt({
        role: "doctor",
        email,
        success: false,
        error: "email_exists",
      });
      return NextResponse.json(
        {
          error:
            "This email is already registered. Please sign in or use a different email.",
        },
        { status: 409 }
      );
    }

    // Fayllar (optional)
    const idDocument =
      (form.get("idDocument") as File | null) || (form.get("profilePhoto") as File | null);
    const diploma =
      (form.get("diploma") as File | null) || (form.get("diplomaFile") as File | null);

    let profilePhotoPath: string | null = null;
    let diplomaPath: string | null = null;
    if (idDocument && typeof idDocument === "object") {
      profilePhotoPath = await saveFileToUploads(idDocument, "doctors");
    }
    if (diploma && typeof diploma === "object") {
      diplomaPath = await saveFileToUploads(diploma, "doctors");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: passwordHash,
        role: "doctor",
        // phone sahən varsa aç
        // phone,
        country: country || null,
        city: city || null,
      },
      select: { id: true, name: true, email: true },
    });

    try {
      await prisma.doctor.create({
        data: {
          fullName,
          email,
          phone,
          profilePhoto: profilePhotoPath,
          diplomaFile: diplomaPath,
          country: country || null,
          city: city || null,
        } as any,
      });
    } catch {
      // doctor modelində fərq varsa, backend-i sonra tənzimləyərik
    }

    await logRegistrationAttempt({
      role: "doctor",
      email,
      success: true,
      meta: { userId: user.id, country, city },
    });
    await logSecurityEvent({
      action: "REGISTER_SUCCESS_DOCTOR",
      userId: user.id,
      email,
      details: { country, city },
    });

    // VERIFY EMAIL
    const token = crypto.randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.emailVerificationToken.create({
      data: { email, token, expiresAt: expires },
    });

    const verifyUrl = `${BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;
    await sendMailViaProjectHelper({
      to: email,
      subject: "Verify your email",
      html: `<p>Hi ${fullName},</p><p>Please verify your email to activate your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    return NextResponse.json({ ok: true, userId: user.id, email: user.email }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002" && e?.meta?.target?.includes("email")) {
      await logRegistrationAttempt({
        role: "doctor",
        email,
        success: false,
        error: "email_exists_P2002",
      });
      return NextResponse.json(
        {
          error:
            "This email is already registered. Please sign in or use a different email.",
        },
        { status: 409 }
      );
    }

    await logRegistrationAttempt({
      role: "doctor",
      email,
      success: false,
      error: e?.message || "server_error",
    });

    console.error("register/doctor error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
