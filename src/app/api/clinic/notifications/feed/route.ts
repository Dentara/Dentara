// app/api/clinic/notifications/feed/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type FeedItem = {
  /** vizual tip (rəng) */
  kind: "info" | "success" | "warning" | "danger";
  /** başlıq */
  title: string;
  /** mətni / qısa izah */
  message: string;
  /** ISO datetime */
  createdAt: string;
  /** biznes tipi (DB-dəki Notification.type) */
  type?: string | null;
  /** ClinicPatient.id – join request üçün */
  membershipId?: string | null;
  /** klik olunanda gedəcəyi url */
  href?: string | null;
};

type FeedOut = { items: FeedItem[] };

/**
 * GET /api/clinic/notifications/feed
 *
 * Clinic üçün UNREAD (readAt IS NULL) notification-ları qaytarır.
 * Bell dropdown və dashboard card-lar bundan istifadə edir.
 */
export async function GET(req: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const clinicId =
    role === "clinic" ? ((session?.user as any)?.id as string) : undefined;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  if (!clinicId) {
    return NextResponse.json({ items: [] } as FeedOut);
  }

  const userId = (session?.user as any)?.id as string | undefined;

  const list = await prisma.notification.findMany({
    where: {
      scope: "clinic",
      clinicId,
      readAt: null, // ✅ yalnız oxunmamışlar
      OR: [
        { clinicId },
        ...(userId ? [{ userId }] : []), // həm clinicId, həm userId üzrə
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const items: FeedItem[] = list.map((n) => {
    const payload: any = n.payload ?? {};
    let kind: FeedItem["kind"] = "info";
    let title = "Notification";
    let message = "";
    let membershipId: string | null = null;
    let href: string | null = null;

    switch (n.type) {
      case "REVIEW_CREATED": {
        kind = "success";
        title = "New patient review";
        message = `Rating ${payload.rating}/5${
          payload.patientName ? ` · ${payload.patientName}` : ""
        }${payload.doctorName ? ` · ${payload.doctorName}` : ""}`;
        href = "/dashboard/clinic/reviews";
        break;
      }
      case "CLINIC_REVIEW_CREATED": {
        kind = "success";
        title = "New clinic review";
        message = `Rating ${payload.rating}/5${
          payload.comment ? ` · “${payload.comment}”` : ""
        }`;
        href = "/dashboard/clinic/reviews";
        break;
      }
      case "PATIENT_JOIN_REQUEST": {
        kind = "info";
        title = "New patient join request";
        membershipId = payload.clinicPatientId ?? null;
        const name = payload.patientName || payload.patientEmail || "A patient";
        const email = payload.patientEmail ? ` (${payload.patientEmail})` : "";
        message = `${name}${email} wants to link to your clinic`;
        href = "/dashboard/clinic/notifications";
        break;
      }
      default: {
        // fallback
        message =
          typeof n.payload === "string"
            ? n.payload
            : message || "New notification";
        href = "/dashboard/clinic/notifications";
        break;
      }
    }

    return {
      kind,
      title,
      message,
      createdAt: n.createdAt.toISOString(),
      type: n.type,
      membershipId,
      href,
    };
  });

  return NextResponse.json({ items } as FeedOut);
}
