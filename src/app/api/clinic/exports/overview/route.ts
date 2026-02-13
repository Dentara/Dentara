import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prisma safe-singleton
const db = (globalThis as any).prisma ?? new PrismaClient();
if (!(globalThis as any).prisma) (globalThis as any).prisma = db;

// Helper: UTC date parse
function parseISO(d?: string | null) {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}

// Helper: clinicId from session (best-effort)
async function getClinicId(request: Request) {
  try {
    const url = new URL(request.url);
    const cid = url.searchParams.get("clinicId");
    if (cid) return Number(cid);
  } catch {}
  try {
    // Optional — if project has next-auth set up
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getServerSession } = await import("next-auth");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions as any);
    const clinicId = (session?.user as any)?.clinicId;
    if (clinicId) return Number(clinicId);
  } catch {}
  return 0; // fallback (no filter)
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = parseISO(url.searchParams.get("from"));
  const to = parseISO(url.searchParams.get("to"));
  const clinicId = await getClinicId(request);

  // Default range = last 30 days
  const now = new Date();
  const dateTo = to ?? now;
  const dateFrom = from ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Where clause builder
  const wBilling: any = { createdAt: { gte: dateFrom, lte: dateTo } };
  const wAppt: any = { createdAt: { gte: dateFrom, lte: dateTo } };
  const wPatient: any = { createdAt: { gte: dateFrom, lte: dateTo } };
  const wDoctor: any = { joinedAt: { gte: dateFrom, lte: dateTo } };

  if (clinicId) {
    wBilling.clinicId = clinicId;
    wAppt.clinicId = clinicId;
    wPatient.clinicId = clinicId;
    wDoctor.clinicId = clinicId;
  }

  // Collect simple KPIs (names align with terminal mənbələri: Billing, Appointment, ClinicPatient, ClinicDoctor)
  let revenue = 0;
  let appointmentsCount = 0;
  let patientsCount = 0;
  let newStaffCount = 0;

  try {
    const [revAgg, apptAgg, patAgg, staffAgg] = await Promise.all([
      db.billing.aggregate({ _sum: { amount: true }, where: wBilling }),
      db.appointment.count({ where: wAppt }),
      db.clinicPatient.count({ where: wPatient }),
      db.clinicDoctor.count({ where: wDoctor }),
    ]);
    revenue = Number(revAgg._sum.amount ?? 0);
    appointmentsCount = apptAgg;
    patientsCount = patAgg;
    newStaffCount = staffAgg;
  } catch (e) {
    // Prisma modeli fərqli olsa belə export işləsin – sıfırlarla qaytarırıq
    console.error("EXPORT_OVERVIEW_QUERY_ERROR:", e);
  }

  // Build CSV
  const rows = [
    ["period_from", dateFrom.toISOString()],
    ["period_to", dateTo.toISOString()],
    ["revenue_usd", revenue.toString()],
    ["appointments", appointmentsCount.toString()],
    ["patients", patientsCount.toString()],
    ["new_staff", newStaffCount.toString()],
  ];
  const csv =
    "key,value\n" +
    rows
      .map(([k, v]) => `${k.replace(/"/g, '""')},"${String(v).replace(/"/g, '""')}"`)
      .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dentara-clinic-overview-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
