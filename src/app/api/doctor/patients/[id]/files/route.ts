import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { requireGrant } from "@/app/libs/consent-guard";
import { writeAccessLog } from "@/app/libs/audit";

// GET /api/doctor/patients/:id/files?scope=xrays|attachments|charts|billing
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Yalnız doctor oxuya bilər (clinic üçün ayrı route artıq var)
  const role = (session.user as any).role as string | undefined;
  if (role !== "doctor") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const patientId = params.id;
  const scope = (url.searchParams.get("scope") || "xrays").toLowerCase();

  // Consent/grant yoxlaması (doctor üçün)
  try {
    await requireGrant({
      patientId,
      requester: { type: "doctor", email: session.user.email! },
      scope, // "xrays" | "attachments" | "charts" | "billing"
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Access requires consent" }, { status: 403 });
  }

  // Faylları gətir
  const files = await prisma.patientFile.findMany({
    where: { patientId, category: scope.toUpperCase() }, // enum DB-də böyük hərflədirsə
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, category: true, url: true, createdAt: true, visibility: true },
  });

  // AccessLog (uğurlu oxunuş)
  await writeAccessLog({
    actorType: "DOCTOR",
    actorEmail: session.user.email!,
    action: "READ",
    resourceType: "PATIENT_FILE",
    patientId,
    meta: { scope, count: files.length },
  });

  return NextResponse.json({ ok: true, files });
}
