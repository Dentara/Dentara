import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // user
  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, name: true, email: true, role: true, emailVerified: true },
  });

  // linked clinics (mövcud endpointdəki məntiqin qısa variantı: appointments üzərindən)
  const apptClinics = await prisma.appointment.findMany({
    where: { patient: { email: user?.email || "" } },
    select: { clinic: { select: { id: true, name: true } } },
    take: 100,
  });
  const clinicMap = new Map<string, string>();
  for (const a of apptClinics) {
    const c = a.clinic;
    if (c?.id) clinicMap.set(c.id, c.name ?? "Clinic");
  }
  const clinics = Array.from(clinicMap, ([id, name]) => ({ id, name }));

  // files
  const files = await prisma.patientFile.findMany({
    where: { patientUserId: u.id },
    select: { id: true, title: true, path: true, mime: true, sizeBytes: true, createdAt: true, type: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // appointments
  const appts = await prisma.appointment.findMany({
    where: { patient: { email: user?.email || "" } },
    select: {
      id: true, status: true, date: true, time: true,
      clinic: { select: { name: true } },
      doctor: { select: { fullName: true } },
    },
    orderBy: { date: "desc" },
    take: 1000,
  });

  // treatments
  const treatments = await prisma.treatmentEntry.findMany({
    where: { OR: [{ patientUserId: u.id }, { patient: { email: user?.email || "" } }] },
    select: {
      id: true, status: true, category: true, date: true, price: true,
      clinic: { select: { name: true } },
      doctor: { select: { fullName: true } },
      teeth: { select: { numberFDI: true } },
    },
    orderBy: { date: "desc" },
    take: 1000,
  });

  // HTML (sadə, oxunaqlı)
  const esc = (x: any) => String(x ?? "").replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]!));
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Tagiza — Patient Export</title>
<style>
  body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Arial,sans-serif; padding:24px; color:#0f172a; background:#fff}
  h1{font-size:22px; margin:0 0 4px}
  h2{font-size:18px; margin:24px 0 8px}
  table{border-collapse:collapse; width:100%; font-size:13px}
  th,td{border:1px solid #e5e7eb; padding:8px; vertical-align:top}
  th{background:#f8fafc; text-align:left}
  .muted{color:#64748b}
  .badge{display:inline-block; padding:2px 8px; border:1px solid #e5e7eb; border-radius:999px; font-size:12px}
  .grid{display:grid; grid-template-columns:1fr 1fr; gap:12px}
  .card{border:1px solid #e5e7eb; border-radius:12px; padding:12px}
</style>
</head>
<body>
  <h1>Tagiza — Patient Export</h1>
  <div class="muted">Generated at: ${new Date().toISOString()}</div>

  <h2>Profile</h2>
  <div class="grid">
    <div class="card"><b>Name:</b> ${esc(user?.name)}</div>
    <div class="card"><b>Email:</b> ${esc(user?.email)}</div>
    <div class="card"><b>Role:</b> <span class="badge">${esc(user?.role || "patient")}</span></div>
    <div class="card"><b>Email verified:</b> ${user?.emailVerified ? "Yes" : "No"}</div>
    <div class="card" style="grid-column:1/-1"><b>Linked clinics:</b> ${clinics.length} ${clinics.length? "(" + clinics.map(c=>esc(c.name)).join(", ") + ")":""}</div>
  </div>

  <h2>Files (${files.length})</h2>
  <table>
    <thead><tr><th>Title</th><th>MIME</th><th>Size</th><th>Date</th><th>Path</th></tr></thead>
    <tbody>
      ${files.map(f=>`<tr>
        <td>${esc(f.title)}</td>
        <td>${esc(f.mime)}</td>
        <td>${f.sizeBytes ?? ""}</td>
        <td>${esc(f.createdAt.toISOString().slice(0,10))}</td>
        <td>${esc(f.path)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>Appointments (${appts.length})</h2>
  <table>
    <thead><tr><th>Date</th><th>Time</th><th>Status</th><th>Clinic</th><th>Doctor</th></tr></thead>
    <tbody>
      ${appts.map(a=>`<tr>
        <td>${esc(a.date?.toISOString?.().slice(0,10) || a.date)}</td>
        <td>${esc(a.time ?? "")}</td>
        <td>${esc(a.status ?? "")}</td>
        <td>${esc(a.clinic?.name ?? "")}</td>
        <td>${esc(a.doctor?.fullName ?? "")}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>Treatments (${treatments.length})</h2>
  <table>
    <thead><tr><th>Date</th><th>Status</th><th>Category</th><th>Clinic</th><th>Doctor</th><th>Teeth (FDI)</th><th>Price</th></tr></thead>
    <tbody>
      ${treatments.map(t=>`<tr>
        <td>${esc(t.date?.toISOString?.().slice(0,10) || t.date)}</td>
        <td>${esc(t.status ?? "")}</td>
        <td>${esc(t.category ?? "")}</td>
        <td>${esc(t.clinic?.name ?? "")}</td>
        <td>${esc(t.doctor?.fullName ?? "")}</td>
        <td>${esc(t.teeth?.map?.(x=>x.numberFDI).join(", ") ?? "")}</td>
        <td>${esc(t.price ?? "")}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="tagiza_report_${new Date().toISOString().slice(0,10)}.html"`,
    },
  });
  return res;
}
