// src/lib/securityLog.ts
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

type SecurityEventAction =
  | "REGISTER_SUCCESS_PATIENT"
  | "REGISTER_SUCCESS_DOCTOR"
  | "REGISTER_SUCCESS_CLINIC"
  | "PROFILE_UPDATE"
  | "PASSWORD_CHANGED"
  | "PASSWORD_CHANGE_FAILED"
  | "ROLE_CHANGED"
  | string;

export async function logSecurityEvent(params: {
  action: SecurityEventAction;
  userId?: string | null;
  email?: string | null;
  targetUserId?: string | null;
  details?: any;
}) {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for") ||
      hdrs.get("x-real-ip") ||
      hdrs.get("cf-connecting-ip") ||
      null;
    const ua = hdrs.get("user-agent") || null;

    await prisma.securityEvent.create({
      data: {
        action: params.action,
        userId: params.userId || null,
        email: params.email || null,
        targetUserId: params.targetUserId || null,
        ip,
        userAgent: ua,
        details: params.details ?? undefined,
      },
    });
  } catch (e) {
    // Security log heç vaxt əsas əməliyyatı bloklamamalıdır
    console.error("SecurityEvent log failed:", e);
  }
}
