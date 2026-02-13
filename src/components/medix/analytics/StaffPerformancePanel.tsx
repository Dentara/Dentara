"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type StaffRow = { name: string; role: string; patients: number; rating: number };

const EMPTY: StaffRow[] = [];

export default function StaffPerformancePanel({
  data: preset,
  endpoint = "/api/clinic/analytics/staff-performance",
  limit = 6,
}: {
  data?: StaffRow[];
  endpoint?: string;
  limit?: number;
}) {
  const [staff, setStaff] = useState<StaffRow[] | null>(preset ?? null);

  useEffect(() => {
    if (preset) return;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(endpoint, { signal: ac.signal });
        if (!res.ok) throw new Error(String(res.status));
        setStaff((await res.json()) as StaffRow[]);
      } catch {
        // fallback boş siyahı
        setStaff(EMPTY);
      }
    })();
    return () => ac.abort();
  }, [endpoint, preset]);

  if (!staff) return <div className="h-[180px] animate-pulse rounded-md bg-muted/40" />;

  if (staff.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No staff performance data yet. Start recording visits to see rankings here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {staff.slice(0, limit).map((p, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{p.name.split(" ")[1]?.[0] || p.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.role}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{p.patients} patients</p>
            <p className="text-xs text-muted-foreground">Rating: {Number(p.rating).toFixed(1)}/5</p>
          </div>
        </div>
      ))}
    </div>
  );
}
