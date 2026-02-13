"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Row = { name: string; revenue: number };

export default function RevenueSourceChart({
  data: preset,
  endpoint = "/api/clinic/analytics/revenue-sources",
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
        setData([
          { name: "Orthodontics", revenue: 0 },
          { name: "Implants", revenue: 0 },
          { name: "Surgery", revenue: 0 },
          { name: "Hygiene", revenue: 0 },
        ]);
      }
    })();
    return () => ac.abort();
  }, [endpoint, preset]);

  if (!data) return <div className="h-[250px] animate-pulse rounded-md bg-muted/40" />;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart layout="vertical" data={data}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip />
        <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
