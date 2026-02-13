// app/(site)/dashboard/patient-files/SearchPatientsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PatientRow = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function SearchPatientsClient() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    p.set("limit", "20");
    return p.toString();
  }, [q]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        // 1) Əsas Patient API
        const [resPatients, resClinic] = await Promise.all([
          fetch(`/api/patients?${qs}`, { cache: "no-store" }),
          // 2) ClinicPatient əsasında aktiv pasiyentlər
          fetch(`/api/clinic/patients?status=ACTIVE&q=${encodeURIComponent(
            q.trim()
          )}`, { cache: "no-store" }),
        ]);

        const rows: PatientRow[] = [];

        // ---- /api/patients ----
        if (resPatients.ok) {
          const data = await resPatients.json();
          const base: PatientRow[] = Array.isArray(data?.patients ?? data)
            ? (data.patients ?? data)
            : [];
          rows.push(...base.map((p) => ({
            id: String(p.id),
            name: p.name ?? null,
            email: p.email ?? null,
          })));
        } else {
          console.error("GET /api/patients failed", await resPatients.text());
        }

        // ---- /api/clinic/patients ----
        if (resClinic.ok) {
          const data = await resClinic.json();
          const cpList: any[] = data?.patients ?? [];
          const existingEmails = new Set(
            rows.map((p) => p.email).filter(Boolean)
          );

          const mappedClinic: PatientRow[] = cpList
            .filter((cp) => !existingEmails.has(cp.email))
            .map((cp) => ({
              // PatientGlobalId varsa → id kimi onu istifadə edirik,
              // yoxdursa ClinicPatient.id qalır
              id: String(cp.patientId ?? cp.id),
              name: cp.fullName ?? cp.email ?? "Patient",
              email: cp.email ?? null,
            }));

          rows.push(...mappedClinic);
        } else {
          console.error(
            "GET /api/clinic/patients failed",
            await resClinic.text()
          );
        }

        if (alive) {
          setList(rows);
        }
      } catch (e) {
        console.error(e);
        if (alive) setList([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [qs, q]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" disabled>
          Search
        </Button>
      </div>

      <div className="rounded-md border">
        {loading ? (
          <div className="p-3 text-sm text-muted-foreground">Loading…</div>
        ) : list.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            No patients found.
          </div>
        ) : (
          <ul className="divide-y">
            {list.map((p) => (
              <li
                key={p.id}
                className="p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {p.name ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.email ?? "—"}
                  </div>
                </div>
                <Link href={`/dashboard/patients/${p.id}/files`}>
                  <Button size="sm">Open Files</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
