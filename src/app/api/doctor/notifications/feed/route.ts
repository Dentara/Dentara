// app/api/doctor/notifications/feed/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type FeedOut = { items: Array<{ kind: string; title: string; message: string; createdAt: string }> };

export async function GET(req: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const doctorId = role === "doctor" ? ((session?.user as any)?.id as string) : undefined;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  if (!doctorId) return NextResponse.json({ items: [] } as FeedOut);

  const list = await prisma.notification.findMany({
    where: { scope: "doctor", doctorId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const items = list.map((n) => {
    let title = "Notification";
    let message = "";
    let kind: "info" | "success" | "warning" | "danger" = "info";

    if (n.type === "REVIEW_CREATED") {
      kind = "success";
      title = "New patient review";
      const p = (n.payload as any) || {};
      message = `Rating ${p.rating}/5${p.patientName ? ` · ${p.patientName}` : ""}${p.clinicName ? ` · ${p.clinicName}` : ""}`;
    }

    return { kind, title, message, createdAt: n.createdAt.toISOString() };
  });

  return NextResponse.json({ items } as FeedOut);
}
