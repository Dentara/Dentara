import prisma from "@/lib/prisma";

type LogParams = {
  actorType: "CLINIC" | "DOCTOR";
  actorEmail: string;
  action: "READ" | "CREATE" | "UPDATE" | "REVOKE";
  resourceType: "PATIENT_FILE" | "GRANT";
  patientId?: string;
  resourceId?: string;
  meta?: any;
};

export async function writeAccessLog(p: LogParams) {
  try {
    await prisma.accessLog.create({
      data: {
        actorType: p.actorType,
        actorEmail: p.actorEmail,
        action: p.action,
        resourceType: p.resourceType,
        patientId: p.patientId ?? null,
        resourceId: p.resourceId ?? null,
        meta: p.meta ? JSON.stringify(p.meta) : null,
      },
    });
  } catch (e) {
    console.error("[ACCESS_LOG_CREATE_FAILED]", e);
  }
}
