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
        const res = await fetch(`/api/patients?${qs}`, { cache: "no-store" });
        if (!res.ok) {
          console.error("GET /api/patients failed", await res.text());
          if (alive) setList([]);
          return;
        }
        const data = await res.json();
        // Normalizə — səndə response {patients: []} ola bilər
        const rows: PatientRow[] = Array.isArray(data?.patients ?? data)
          ? (data.patients ?? data)
          : [];
        if (alive) setList(rows);
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
  }, [qs]);

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
          <div className="p-3 text-sm text-muted-foreground">No patients found.</div>
        ) : (
          <ul className="divide-y">
            {list.map((p) => (
              <li key={p.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.email ?? "—"}</div>
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
