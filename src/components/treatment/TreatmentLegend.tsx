"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TreatmentLegend() {
  const rows = [
    { color: "bg-sky-500", label: "Exam / Preventive" },
    { color: "bg-blue-600", label: "Restorative" },
    { color: "bg-violet-600", label: "Endodontic" },
    { color: "bg-emerald-600", label: "Periodontic" },
    { color: "bg-amber-600", label: "Prosthetic (Crown / Bridge)" },
    { color: "bg-orange-500", label: "Orthodontic" },
    { color: "bg-rose-600", label: "Surgical / Implant" },
    { color: "bg-slate-300", label: "Other / No data" },
  ];
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Legend</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 text-sm">
            <span className={`w-4 h-4 rounded ${r.color}`} />
            <span>{r.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
