"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Base = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string; // ISO
  patient:
    | {
        id?: string | null;
        name?: string | null;
        email?: string | null;
        href?: string | null;
      }
    | null;
};

type ClinicReviewItem = Base & {
  clinic: { id: string; name: string | null } | null;
};

type DoctorReviewItem = Base & {
  doctor: { id: string; fullName: string | null } | null;
};

function stars(n: number) {
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
}

export default function ClinicReviewsPage() {
  const [clinicReviews, setClinicReviews] = useState<ClinicReviewItem[]>([]);
  const [doctorReviews, setDoctorReviews] = useState<DoctorReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/clinic/reviews?take=100", {
          cache: "no-store",
        });
        if (r.ok) {
          const j = await r.json();
          setClinicReviews(j.clinicReviews ?? []);
          setDoctorReviews(j.doctorReviews ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <Tabs defaultValue="clinic">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <TabsList>
            <TabsTrigger value="clinic">Clinic</TabsTrigger>
            <TabsTrigger value="doctor">Doctor</TabsTrigger>
          </TabsList>
        </div>

        {/* === Clinic tab === */}
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : clinicReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No clinic reviews yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {clinicReviews.map((r) => (
                    <li key={r.id} className="rounded border p-3 bg-amber-50/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-amber-500 text-sm">
                            {stars(r.rating)}
                          </div>
                          {r.comment && (
                            <div className="italic text-sm mt-1">
                              “{r.comment}”
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(r.createdAt).toLocaleString()} ·{" "}
                            {r.clinic?.name || "Clinic"}
                          </div>
                        </div>

                        <div className="text-right">
                          {r.patient?.name || r.patient?.email ? (
                            <div className="text-xs">
                              <div className="font-medium">
                                {r.patient?.href ? (
                                  <a
                                    href={r.patient.href}
                                    className="hover:underline"
                                  >
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
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Doctor tab === */}
        <TabsContent value="doctor">
          <Card>
            <CardHeader>
              <CardTitle>Doctor reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : doctorReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No doctor reviews yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {doctorReviews.map((r) => (
                    <li key={r.id} className="rounded border p-3 bg-amber-50/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-amber-500 text-sm">
                            {stars(r.rating)}
                          </div>
                          {r.comment && (
                            <div className="italic text-sm mt-1">
                              “{r.comment}”
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(r.createdAt).toLocaleString()} ·{" "}
                            {r.doctor?.fullName || "Doctor"}
                          </div>
                        </div>

                        <div className="text-right">
                          {r.patient?.name || r.patient?.email ? (
                            <div className="text-xs">
                              <div className="font-medium">
                                {r.patient?.href ? (
                                  <a
                                    href={r.patient.href}
                                    className="hover:underline"
                                  >
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
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
