"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

type Row = { ageGroup: string; male: number; female: number };

export default function PatientDemographicsChart({
  data: preset,
  endpoint = "/api/clinic/analytics/patient-demographics",
}: {
  data?: Row[];
  endpoint?: string;
}) {
  const [data, setData] = useState<Row[] | null>(preset ?? null);

  useEffect(() => {
    if (preset) return;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(endpoint, { signal: ac.signal });
        if (!res.ok) throw new Error(String(res.status));
        setData((await res.json()) as Row[]);
      } catch {
        // fallback boş dataset
        setData([
          { ageGroup: "0–17", male: 0, female: 0 },
          { ageGroup: "18–34", male: 0, female: 0 },
          { ageGroup: "35–44", male: 0, female: 0 },
          { ageGroup: "45–64", male: 0, female: 0 },
          { ageGroup: "65+", male: 0, female: 0 },
        ]);
      }
    })();
    return () => ac.abort();
  }, [endpoint, preset]);

  if (!data) return <div className="h-[250px] animate-pulse rounded-md bg-muted/40" />;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="ageGroup" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="male" fill="#2563eb" name="Male" />
        <Bar dataKey="female" fill="#ec4899" name="Female" />
      </BarChart>
    </ResponsiveContainer>
  );
}
