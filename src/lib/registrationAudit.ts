// src/lib/registrationAudit.ts
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Role = "patient" | "doctor" | "clinic";

export async function logRegistrationAttempt(params: {
  role: Role;
  email: string;
  success: boolean;
  error?: string | null;
  meta?: any;
}) {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for") ||
      hdrs.get("x-real-ip") ||
      hdrs.get("cf-connecting-ip") ||
      null;
    const ua = hdrs.get("user-agent") || null;

    await prisma.registrationAudit.create({
      data: {
        email: params.email.toLowerCase(),
        role: params.role,
        success: params.success,
        error: params.error || null,
        ip: ip || null,
        userAgent: ua,
        meta: params.meta ?? undefined,
      },
    });
  } catch (e) {
    // audit-in özü uğursuz olarsa, auth axınını bloklamırıq
    console.error("RegistrationAudit failed", e);
  }
}
