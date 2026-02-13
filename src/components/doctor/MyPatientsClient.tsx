"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Row = { id: string; name: string | null; email: string | null };

export default function MyPatientsClient({ rows, linked }: { rows: Row[]; linked: boolean }) {
  const [q, setQ] = React.useState("");
  const [list, setList] = React.useState<Row[]>(rows);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return setList(rows);
    setList(
      rows.filter((r) =>
        [r.id, r.name || "", r.email || ""].some((x) => x.toLowerCase().includes(qq))
      )
    );
  }, [q, rows]);

  function copy(id: string) {
    navigator.clipboard?.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    });
  }

  return (
    <div className="p-4 space-y-4">
      {/* search */}
      <div className="flex items-center gap-2">
        <input
          className="border rounded-md px-3 py-2 w-full max-w-md"
          placeholder="Search (name, email or ID)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">{list.length} result(s)</span>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-muted-foreground">
                  No patients found.
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.name || "—"}</td>
                  <td className="px-3 py-2">{r.email || "—"}</td>
                  <td className="px-3 py-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.id}</code>
                    <button
                      className="ml-2 text-xs underline"
                      onClick={() => copy(r.id)}
                      title="Copy ID"
                    >
                      {copiedId === r.id ? "Copied" : "Copy"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" title="Open treatment history">
                        <Link href={`/dashboard/doctor-self/patient-treatments/${r.id}`}>Open History</Link>
                      </Button>

                      {/* Klinikaya link deyilsə, gələcəkdə “Edit patient”/“Create treatment” kimi şəxsi kabinet əməliyyatları da əlavə oluna bilər */}
                      {!linked && (
                        <Button asChild size="sm" variant="outline" title="Open files (clinic-linked required)" disabled>
                          <span>Files</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
