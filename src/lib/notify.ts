// src/lib/notify.ts
import { prisma } from "@/lib/prisma";

type CommonPayload = Record<string, any>;

export async function notifyClinic(params: {
  clinicId: string;
  type: string;
  userId?: string | null;
  payload?: CommonPayload;
}) {
  const { clinicId, type, userId, payload } = params;
  try {
    await prisma.notification.create({
      data: {
        scope: "clinic",
        clinicId,
        userId: userId ?? null,
        type,
        payload: payload ?? {},
      },
    });
  } catch (e) {
    console.error("[notifyClinic] failed", e);
  }
}

export async function notifyDoctor(params: {
  doctorId: string;
  type: string;
  userId?: string | null;
  payload?: CommonPayload;
}) {
  const { doctorId, type, userId, payload } = params;
  try {
    await prisma.notification.create({
      data: {
        scope: "doctor",
        doctorId,
        userId: userId ?? null,
        type,
        payload: payload ?? {},
      },
    });
  } catch (e) {
    console.error("[notifyDoctor] failed", e);
  }
}

export async function notifyPatient(params: {
  patientUserId: string;
  type: string;
  payload?: CommonPayload;
}) {
  const { patientUserId, type, payload } = params;
  try {
    await prisma.notification.create({
      data: {
        scope: "patient",
        userId: patientUserId,
        type,
        payload: payload ?? {},
      },
    });
  } catch (e) {
    console.error("[notifyPatient] failed", e);
  }
}
