// app/(site)/dashboard/clinic/patient-treatments/page.tsx
// INDEX (LIST) PAGE — Klinikaya bağlı pasiyentlərin siyahısı, hər biri öz tarixçə detalına aparır
import React from "react";
import Link from "next/link";
import { headers } from "next/headers";

type PatientLite = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

function normalizePatients(payload: any): PatientLite[] {
  // Cavab həm array ola bilər, həm də { items } / { patients }
  const arr: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.patients)
    ? payload.patients
    : [];

  // Hər element üçün id-ni bir neçə yerdən sınayırıq:
  return arr
    .map((p: any) => {
      const id =
        p?.id ??
        p?.patientId ??
        p?.patientGlobalId ??
        p?.patientGlobal?.id ??
        p?.patient?.id ??
        null;

      if (!id) return null;

      const name =
        p?.name ??
        p?.patientName ??
        p?.patient?.name ??
        p?.patientGlobal?.name ??
        null;

      const email =
        p?.email ??
        p?.patientEmail ??
        p?.patient?.email ??
        p?.patientUser?.email ??
        p?.patientGlobal?.email ??
        null;

      const phone =
        p?.phone ??
        p?.patientPhone ??
        p?.patient?.phone ??
        p?.patientGlobal?.phone ??
        null;

      return { id, name, email, phone } as PatientLite;
    })
    .filter(Boolean) as PatientLite[];
}

async function loadClinicPatients(): Promise<PatientLite[]> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const proto = (h.get("x-forwarded-proto") ?? "http").replace(/:$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";

  // 1) Klinikaya bağlı pasiyentlər
  const urlClinic = `${proto}://${host}/api/clinic/patient-search?limit=200`;
  try {
    const res = await fetch(urlClinic, { cache: "no-store", headers: { cookie } });
    if (res.ok) {
      const j = await res.json().catch(() => []);
      const list = normalizePatients(j);
      if (list.length > 0) return list;
    }
  } catch {
    // pass
  }

  // 2) Fallback: global /api/patients (ən azı nəsə görünsün)
  try {
    const res = await fetch(`${proto}://${host}/api/patients?q=`, {
      cache: "no-store",
      headers: { cookie },
    });
    if (res.ok) {
      const j = await res.json().catch(() => []);
      const arr: any[] = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : [];
      return arr
        .map((p: any) => ({
          id: p?.id ?? p?.patientId ?? null,
          name: p?.name ?? null,
          email: p?.email ?? null,
          phone: p?.phone ?? null,
        }))
        .filter((x) => x.id) as PatientLite[];
    }
  } catch {
    // pass
  }

  return [];
}

export default async function Page() {
  const patients = await loadClinicPatients();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Clinic — Patient Treatment History</h1>

      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-medium">Patient list</h2>
        </div>

        <div className="p-3 space-y-2">
          {patients.length === 0 && (
            <div className="text-sm text-muted-foreground">No patients found for this clinic.</div>
          )}

          {patients.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium">{p.name || "Unnamed patient"}</div>
                <div className="text-xs text-muted-foreground">
                  {p.email || p.phone || "—"}
                </div>
              </div>
              <Link
                href={`/dashboard/clinic/patient-treatments/${p.id}`}
                className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-muted"
              >
                Open History
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
