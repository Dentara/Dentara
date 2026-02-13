"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Status = "PLANNED" | "DONE" | "CANCELLED";

export default function TreatmentStatusActions({
  id,
  value,
  onChanged,
}: {
  id: string;
  value: Status;
  onChanged?: (next: Status) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function setStatus(next: Status) {
    if (next === value) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/treatments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j?.error || "Failed to update status");
        return;
      }
      toast.success("Status updated");
      onChanged?.(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy}>
          {value === "DONE" ? (
            <Badge>Done</Badge>
          ) : value === "PLANNED" ? (
            <Badge variant="secondary">Planned</Badge>
          ) : (
            <Badge variant="destructive">Cancelled</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setStatus("PLANNED")}>Planned</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("DONE")}>Done</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("CANCELLED")}>Cancelled</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
