"use client";
import { useEffect, useState } from "react";

type Item = { name: string; updated: string };

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch("/api/clinic/reports/catalog")
      .then(r => r.json())
      .then((j) => setItems(j?.patient ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Patient Reports</h1>
      <ul className="space-y-2">
        {items.map((r, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">{r.name}</span>
            <span className="text-xs text-muted-foreground">Updated: {r.updated}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
