"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Item = { name: string; value: number };

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Optional props: pass preloaded data or override endpoint
export default function AppointmentTypeChart({
  data: preset,
  endpoint = "/api/clinic/analytics/appointment-types",
}: {
  data?: Item[];
  endpoint?: string;
}) {
  const [data, setData] = useState<Item[] | null>(preset ?? null);
  const isEmpty = useMemo(() => (data ?? []).reduce((a, b) => a + b.value, 0) === 0, [data]);

  useEffect(() => {
    if (preset) return;
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(endpoint, { signal: ac.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as Item[];
        setData(json);
      } catch {
        // Graceful fallback (no API yet)
        setData([
          { name: "Checkups", value: 0 },
          { name: "Orthodontics", value: 0 },
          { name: "Surgery", value: 0 },
          { name: "Implants", value: 0 },
        ]);
      }
    })();

    return () => ac.abort();
  }, [endpoint, preset]);

  if (!data) {
    return <div className="h-[250px] animate-pulse rounded-md bg-muted/40" />;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => (isEmpty ? 0 : v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
