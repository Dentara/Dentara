import { PrismaClient, ActorType } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * scope nümunələri: "xrays", "attachments", "charts", "billing"
 */
export async function hasPatientGrant(params: {
  patientUserId: string;
  scope: string;
  granteeClinicId?: string | null;
  granteeDoctorUserId?: string | null;
}) {
  const { patientUserId, scope, granteeClinicId, granteeDoctorUserId } = params;

  const now = new Date();
  const grants = await prisma.patientDataGrant.findMany({
    where: {
      patientUserId,
      revokedAt: null,
      OR: [
        granteeClinicId ? { granteeType: ActorType.CLINIC, granteeClinicId } : undefined,
        granteeDoctorUserId ? { granteeType: ActorType.DOCTOR, granteeDoctorUserId } : undefined,
      ].filter(Boolean) as any,
    },
    select: { id: true, expiresAt: true, scopes: true },
  });

  for (const g of grants) {
    if (g.expiresAt && g.expiresAt < now) continue;
    try {
      const scopes: string[] = Array.isArray(g.scopes) ? (g.scopes as any) : JSON.parse(String(g.scopes || "[]"));
      if (scopes.includes(scope)) return true;
    } catch {
      // ignore parsing failures
    }
  }
  return false;
}

/**
 * Clinic və ya Doctor aktoru üçün xəstənin fayllarına baxmaq icazəsi varmı?
 */
export async function canViewPatientResource(params: {
  patientUserId: string;
  scope: string; // "xrays" | "attachments" | "charts" | "billing"
  actor: { type: "clinic" | "doctor"; clinicId?: string; doctorUserId?: string };
}) {
  const { patientUserId, scope, actor } = params;

  if (actor.type === "clinic") {
    if (!actor.clinicId) return false;
    return hasPatientGrant({
      patientUserId,
      scope,
      granteeClinicId: actor.clinicId,
    });
  }

  if (actor.type === "doctor") {
    if (!actor.doctorUserId) return false;
    return hasPatientGrant({
      patientUserId,
      scope,
      granteeDoctorUserId: actor.doctorUserId,
    });
  }

  return false;
}
