import { canViewPatientResource } from "./consent";

/**
 * İstifadə nümunəsi (server action və ya route daxilində):
 *  await requireGrant({
 *    patientUserId,
 *    scope: "xrays",
 *    actor: { type: "clinic", clinicId }
 *  });
 */
export async function requireGrant(params: {
  patientUserId: string;
  scope: "xrays" | "attachments" | "charts" | "billing";
  actor: { type: "clinic" | "doctor"; clinicId?: string; doctorUserId?: string };
}) {
  const ok = await canViewPatientResource(params);
  if (!ok) {
    const err = new Error("FORBIDDEN_CONSENT_REQUIRED");
    (err as any).status = 403;
    throw err;
  }
}
