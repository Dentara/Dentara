import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

function toCSV(rows: any[], headers: string[]): string {
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => esc(r[h])).join(",")).join("\n");
  return head + (body ? "\n" + body : "");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, name: true, email: true, role: true, emailVerified: true },
  });

  const files = await prisma.patientFile.findMany({
    where: { patientUserId: u.id },
    select: { id: true, title: true, path: true, mime: true, sizeBytes: true, createdAt: true, albumId: true, type: true },
    orderBy: { createdAt: "desc" },
  });

  const appts = await prisma.appointment.findMany({
    where: {
      OR: [
        { patient: { email: user?.email || "" } },
        { doctor: { email: user?.email || "" } },
      ],
    },
    select: {
      id: true, status: true, date: true, time: true,
      clinic: { select: { id: true, name: true } },
      doctor: { select: { id: true, fullName: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
    take: 2000,
  });

  const treatments = await prisma.treatmentEntry.findMany({
    where: {
      OR: [
        { patientUserId: u.id },
        { patient: { email: user?.email || "" } },
        { doctor: { email: user?.email || "" } },
      ],
    },
    select: {
      id: true, status: true, category: true, date: true, price: true,
      clinic: { select: { id: true, name: true } },
      doctor: { select: { id: true, fullName: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
      teeth: { select: { numberFDI: true } },
      attachments: { select: { patientFile: { select: { id: true, title: true, path: true } } } },
    },
    orderBy: { date: "desc" },
    take: 3000,
  });

  // CSV-lər
  const profileRows = [
    { key: "platform", value: "Tagiza" },
    { key: "generatedAt", value: new Date().toISOString() },
    { key: "userId", value: user?.id || "" },
    { key: "name", value: user?.name || "" },
    { key: "email", value: user?.email || "" },
    { key: "role", value: user?.role || "" },
    { key: "emailVerified", value: String(!!user?.emailVerified) },
  ];
  const profileCSV = toCSV(profileRows, ["key", "value"]);

  const filesCSV = toCSV(
    files.map(f => ({
      id: f.id, title: f.title, path: f.path, mime: f.mime || "",
      sizeBytes: f.sizeBytes ?? "", createdAt: f.createdAt.toISOString(),
      albumId: f.albumId ?? "", type: f.type, publicUrl: f.path,
    })),
    ["id","title","path","mime","sizeBytes","createdAt","albumId","type","publicUrl"]
  );

  const apptsCSV = toCSV(
    appts.map(a => ({
      id: a.id, status: a.status,
      date: a.date ? new Date(a.date as any).toISOString().slice(0,10) : "",
      time: a.time || "",
      clinicId: a.clinic?.id || "", clinicName: a.clinic?.name || "",
      doctorId: a.doctor?.id || "", doctorName: a.doctor?.fullName || "",
      patientId: a.patient?.id || "", patientName: a.patient?.name || "",
    })),
    ["id","status","date","time","clinicId","clinicName","doctorId","doctorName","patientId","patientName"]
  );

  const treatmentsCSV = toCSV(
    treatments.map(t => ({
      id: t.id, status: t.status, category: t.category,
      date: t.date ? new Date(t.date as any).toISOString().slice(0,10) : "",
      price: (t as any).price ?? "",
      clinicId: t.clinic?.id || "", clinicName: t.clinic?.name || "",
      doctorId: t.doctor?.id || "", doctorName: t.doctor?.fullName || "",
      patientId: t.patient?.id || "", patientName: t.patient?.name || "",
      teeth: t.teeth?.map(x => x.numberFDI).join(" ") || "",
      attachmentFiles: t.attachments?.map(a => a.patientFile?.path).filter(Boolean).join(" | ") || "",
    })),
    ["id","status","category","date","price","clinicId","clinicName","doctorId","doctorName","patientId","patientName","teeth","attachmentFiles"]
  );

  const readme =
`TAGIZA — Account Data Export (ZIP)
Generated at: ${new Date().toISOString()}

Files:
- profile.csv
- files.csv
- appointments.csv
- treatments.csv
`;

  const zip = new JSZip();
  zip.file("README.txt", readme);
  zip.file("profile.csv", profileCSV);
  zip.file("files.csv", filesCSV);
  zip.file("appointments.csv", apptsCSV);
  zip.file("treatments.csv", treatmentsCSV);

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  const res = new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="tagiza_export_${new Date().toISOString().slice(0,10)}.zip"`,
      "Content-Length": String(buf.length),
    },
  });
  res.cookies.set({ name: "tgz_last_export", value: new Date().toISOString(), httpOnly: false, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
