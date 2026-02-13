"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type Row = { title: string; value: number };

const DEFAULTS: Row[] = [
  { title: "Very Satisfied", value: 0 },
  { title: "Satisfied", value: 0 },
  { title: "Neutral", value: 0 },
  { title: "Dissatisfied", value: 0 },
  { title: "Very Dissatisfied", value: 0 },
];

export default function SatisfactionPanel({
  data: preset,
  endpoint = "/api/clinic/analytics/patient-satisfaction",
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
        setData(DEFAULTS);
      }
    })();
    return () => ac.abort();
  }, [endpoint, preset]);

  if (!data) return <div className="h-[160px] animate-pulse rounded-md bg-muted/40" />;

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm font-medium mb-1">
            <span>{item.title}</span>
            <span>{Math.max(0, Math.min(100, item.value))}%</span>
          </div>
          <Progress value={Math.max(0, Math.min(100, item.value))} className="h-2 [&>*]:bg-green-500" />
        </div>
      ))}
    </div>
  );
}
