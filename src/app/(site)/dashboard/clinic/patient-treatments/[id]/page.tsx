// app/(site)/dashboard/clinic/patient-treatments/[id]/page.tsx
import React from "react";
import { headers } from "next/headers";
import Link from "next/link";
import ClinicTreatmentFiltersClient from "@/components/treatment/ClinicTreatmentFiltersClient";
import TreatmentLegend from "@/components/treatment/TreatmentLegend";
import TreatmentTable from "@/components/treatment/TreatmentTable";
import ToothChart from "@/components/treatment/ToothChart";

type TreatmentEntry = {
  id: string;
  date: string;
  status: "PLANNED" | "DONE" | "CANCELLED";
  category: string;
  procedureCode?: string | null;
  procedureName?: string | null;
  patient?: { id: string; name?: string | null } | null;
  clinic?: { id: string; name?: string | null } | null;
  teeth?: { numberFDI?: number | null; number?: number | null }[];
};

function buildLatestPerTooth(entries: TreatmentEntry[]) {
  const latest = new Map<number, TreatmentEntry>();
  const done = entries.filter((e) => e.status === "DONE");
  done.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  for (const e of done) {
    for (const t of e.teeth || []) {
      const n = (t.numberFDI ?? t.number) as number;
      if (!n) continue;
      latest.set(n, e);
    }
  }
  return latest;
}

function buildSegmentsMap(entries: TreatmentEntry[]) {
  const seg = new Map<number, string[]>();
  const PRI = ["ENDODONTIC","RESTORATIVE","PROSTHETIC","IMPLANT","SURGICAL","ORTHODONTIC","PERIODONTIC","EXAM","PREVENTIVE","OTHER"];
  const done = entries.filter((e) => e.status === "DONE");
  done.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  for (const e of done) {
    const cat = String(e.category || "OTHER").toUpperCase();
    for (const t of e.teeth || []) {
      const n = Number(t.numberFDI ?? t.number);
      if (!n) continue;
      const arr = seg.get(n) || [];
      if (!arr.includes(cat)) arr.push(cat);
      const sorted = arr.slice(0,6).sort((a,b)=>PRI.indexOf(a)-PRI.indexOf(b)).slice(0,3);
      seg.set(n, sorted);
    }
  }
  return seg;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { id: patientId } = await params;

  const doctorId = typeof sp?.doctorId === "string" ? sp.doctorId : "";
  const category = typeof sp?.category === "string" ? sp.category : "";
  const status   = typeof sp?.status   === "string" ? sp.status   : "";
  const from     = typeof sp?.from     === "string" ? sp.from     : "";
  const to       = typeof sp?.to       === "string" ? sp.to       : "";

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const proto  = (h.get("x-forwarded-proto") ?? "http").replace(/:$/, "");
  const host   = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";

  const qs = new URLSearchParams();
  qs.set("patientId", patientId);
  if (doctorId) qs.set("doctorId", doctorId);
  if (category) qs.set("category", category);
  if (status)   qs.set("status", status);
  if (from)     qs.set("from", from);
  if (to)       qs.set("to", to);

  const url = `${proto}://${host}/api/treatments?${qs.toString()}`;
  let items: TreatmentEntry[] = [];
  try {
    const res = await fetch(url, { cache: "no-store", headers: { cookie } });
    if (res.ok) {
      const j = await res.json().catch(() => ({ items: [] }));
      items = Array.isArray(j) ? j : (Array.isArray(j?.items) ? j.items : []);
    }
  } catch {
    items = [];
  }

  const latestMap = buildLatestPerTooth(items);
  const segmentsMap = buildSegmentsMap(items);

  return (
    <div className="p-6">
      <div className="mb-3 flex items-center gap-3">
        <Link
          href="/dashboard/clinic/patient-treatments"
          className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-muted"
        >
          ← Back to list
        </Link>
        <h1 className="text-xl font-semibold">Clinic — Treatment History (Patient)</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8">
          <div className="rounded-lg border p-4 mb-4">
            <ClinicTreatmentFiltersClient
              mode="history"
              fixedPatientId={patientId}
              initialDoctorId={doctorId}
              initialCategory={category}
              initialStatus={status}
              initialFrom={from}
              initialTo={to}
            />
          </div>

          <div className="rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-medium">Treatment History</h2>
            </div>
            <div className="p-2">
              <TreatmentTable
                items={items as any}
                variant="cards"
                patientProfileHref={`/dashboard/patients/${patientId}`}
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h3 className="font-medium">Legend</h3>
            </div>
            <div className="p-3">
              <TreatmentLegend />
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h3 className="font-medium">Teeth map (latest)</h3>
            </div>
            <div className="p-3">
              <ToothChart
                selected={[]}
                readOnly
                latestMap={Object.fromEntries(latestMap) as any}
                segmentsMap={Object.fromEntries(segmentsMap) as any}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
