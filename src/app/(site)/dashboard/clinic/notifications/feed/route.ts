import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const db = (globalThis as any).prisma ?? new PrismaClient();
if (!(globalThis as any).prisma) (globalThis as any).prisma = db;

function parseISO(d?: string | null) {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}
async function getClinicId(request: Request) {
  // ?clinicId=... prioritet, sonra session (əgər var)
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("clinicId");
  if (fromQuery) return Number(fromQuery);

  try {
    const { getServerSession } = await import("next-auth");
    // authOptions layihəndə haradadırsa oradan import et
    const { authOptions } = await import("@/lib/auth");
    const s = await getServerSession(authOptions as any);
    const cid = (s?.user as any)?.clinicId;
    if (cid) return Number(cid);
  } catch {}
  return 0;
}

type FeedItem = {
  id: string;
  kind: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  createdAt: string; // ISO
};

// Sadə “time ago” yazısı frontend üçün də istifadə oluna bilər, amma burada ISO qaytarırıq
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 30)));
  const since = parseISO(url.searchParams.get("since")); // optional
  const clinicId = await getClinicId(req);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const from = since ?? sevenDaysAgo;

  // Where-lər
  const wAppt: any = { createdAt: { gte: from, lte: now } };
  const wBill: any = { createdAt: { gte: from, lte: now } };
  const wPatient: any = { createdAt: { gte: from, lte: now } };
  if (clinicId) {
    wAppt.clinicId = clinicId;
    wBill.clinicId = clinicId;
    wPatient.clinicId = clinicId;
  }

  // İndeks/Model adları səndə olduğu kimidir (Appointment, Billing, ClinicPatient)
  let items: FeedItem[] = [];
  try {
    const [appts, bills, pats] = await Promise.all([
      db.appointment.findMany({
        where: wAppt,
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
        take: limit,
      }),
      db.billing.findMany({
        where: wBill,
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true, amount: true },
        take: limit,
      }),
      db.clinicPatient.findMany({
        where: wPatient,
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
        take: limit,
      }),
    ]);

    items = [
      ...appts.map((a) => ({
        id: `appt_${a.id}`,
        kind: "info" as const,
        title: "New appointment",
        message: "A new appointment was created.",
        createdAt: a.createdAt.toISOString(),
      })),
      ...bills.map((b) => ({
        id: `pay_${b.id}`,
        kind: "success" as const,
        title: "Payment received",
        message: `A payment was recorded: $${Number(b.amount ?? 0).toFixed(2)}.`,
        createdAt: b.createdAt.toISOString(),
      })),
      ...pats.map((p) => ({
        id: `pat_${p.id}`,
        kind: "info" as const,
        title: "New patient",
        message: "A patient account was linked to your clinic.",
        createdAt: p.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      .slice(0, limit);
  } catch (e) {
    // Model adları fərqlidirsə belə API 200 qaytarsın
    console.error("NOTIF_FEED_ERROR:", e);
    items = [];
  }

  return NextResponse.json({ items });
}
