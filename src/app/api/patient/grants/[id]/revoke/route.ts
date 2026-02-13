import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { writeAccessLog } from "@/app/libs/audit";

/**
 * PATCH /api/patient/grants/[id]/revoke
 * Body: boş
 */
export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const patientUserId = (session.user as any).id as string | undefined;
  if (!patientUserId) {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 400 });
  }

  const grant = await prisma.patientDataGrant.findFirst({
    where: { id: params.id, patientUserId },
    select: { id: true, status: true, granteeType: true, granteeEmail: true, scopes: true },
  });

  if (!grant) {
    return NextResponse.json({ ok: false, error: "Grant not found" }, { status: 404 });
  }
  if (grant.status === "REVOKED") {
    return NextResponse.json({ ok: true, grant });
  }

  const updated = await prisma.patientDataGrant.update({
    where: { id: params.id },
    data: { status: "REVOKED" },
    select: { id: true, status: true },
  });

  // Audit (revoke)
  await writeAccessLog({
    actorType: "DOCTOR", // yuxarıdakı qeydə bax
    actorEmail: session.user.email || "patient",
    action: "REVOKE",
    resourceType: "GRANT",
    resourceId: updated.id,
    meta: { granteeType: grant.granteeType, granteeEmail: grant.granteeEmail, scopes: grant.scopes },
  });

  return NextResponse.json({ ok: true, grant: updated });
}
