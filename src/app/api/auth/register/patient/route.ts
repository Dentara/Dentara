// app/api/auth/register/patient/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
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

export async function POST(req: Request) {
  let email = "";
  try {
    const ct = req.headers.get("content-type") || "";
    let fullName = "",
      password = "",
      phone = "",
      country = "",
      city = "",
      captchaToken = "";

    if (ct.includes("application/json")) {
      const body = await req.json();
      fullName = String(body.fullName || "").trim();
      email = String(body.email || "").trim().toLowerCase();
      password = String(body.password || "");
      phone = String(body.phone || "");
      country = String(body.country || "");
      city = String(body.city || "");
      captchaToken = String(body.captchaToken || "");
    } else if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      fullName = String(form.get("fullName") || "").trim();
      email = String(form.get("email") || "").trim().toLowerCase();
      password = String(form.get("password") || "");
      phone = String(form.get("phone") || "");
      country = String(form.get("country") || "");
      city = String(form.get("city") || "");
      captchaToken = String(form.get("captchaToken") || "");
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    if (!fullName || !email || !password) {
      await logRegistrationAttempt({
        role: "patient",
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
        role: "patient",
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
        role: "patient",
        email,
        success: false,
        error: "missing_captcha",
      });
      return NextResponse.json({ error: "Captcha is required" }, { status: 400 });
    }

    // Rate limit: eyni email üçün 10 dəq ərzində max 5 qeydiyyat cəhdi
    const rl = checkRateLimit({
      key: `register:patient:${email}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.allowed) {
      await logRegistrationAttempt({
        role: "patient",
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
        role: "patient",
        email,
        success: false,
        error: `captcha_failed: ${captchaResult.reason}`,
      });
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    // DUPLICATE CHECK — 409
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await logRegistrationAttempt({
        role: "patient",
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

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: passwordHash,
        role: "patient",
        // phone sahən varsa aç
        // phone,
        country: country || null,
        city: city || null,
      },
      select: { id: true, name: true, email: true },
    });

    await logRegistrationAttempt({
      role: "patient",
      email,
      success: true,
      meta: { userId: user.id, country, city },
    });
    await logSecurityEvent({
      action: "REGISTER_SUCCESS_PATIENT",
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
        role: "patient",
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
      role: "patient",
      email,
      success: false,
      error: e?.message || "server_error",
    });

    console.error("register/patient error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
