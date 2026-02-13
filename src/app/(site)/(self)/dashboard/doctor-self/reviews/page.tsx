"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string; // ISO
  clinic?: { id: string; name: string | null } | null;
  patient?:
    | {
        id?: string | null;
        name?: string | null;
        email?: string | null;
      }
    | null;
};

function stars(n: number) {
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
}

export default function DoctorReviewsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/doctor/reviews?take=100", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          setItems(j.items ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((r) => {
                // Doctor konteksində patient profilinə keçid:
                const patientQuery =
                  r.patient?.id || r.patient?.email
                    ? encodeURIComponent(r.patient?.id || (r.patient?.email as string))
                    : null;
                const patientHref = patientQuery
                  ? `/dashboard/doctor-self/patients?query=${patientQuery}`
                  : null;

                return (
                  <li key={r.id} className="rounded border p-3 bg-amber-50/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-amber-500 text-sm">{stars(r.rating)}</div>
                        {r.comment && <div className="italic text-sm mt-1">“{r.comment}”</div>}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(r.createdAt).toLocaleString()} · {r.clinic?.name || "Clinic"}
                        </div>
                      </div>

                      <div className="text-right">
                        {r.patient?.name || r.patient?.email ? (
                          <div className="text-xs">
                            <div className="font-medium">
                              {patientHref ? (
                                <a href={patientHref} className="hover:underline">
                                  {r.patient?.name || "Patient"}
                                </a>
                              ) : (
                                r.patient?.name || "Patient"
                              )}
                            </div>
                            {r.patient?.email ? (
                              <a
                                className="underline text-muted-foreground"
                                href={`mailto:${r.patient.email}`}
                              >
                                {r.patient.email}
                              </a>
                            ) : null}
                          </div>
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
