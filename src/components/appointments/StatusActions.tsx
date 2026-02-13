"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const ALLOWED = ["in_progress", "completed", "cancelled"] as const;
type Allowed = (typeof ALLOWED)[number];

export default function StatusActions({
  id,
  status,
  onChanged,
}: {
  id: string;
  status?: string;
  onChanged?: (s: string) => void;
}) {
  const [pending, setPending] = useState<Allowed | null>(null);

  async function setStatus(s: Allowed) {
    setPending(s);
    try {
      const res = await fetch(`/api/clinic/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const j = await res.json();
      onChanged?.(j.status);
    } catch (e) {
      console.error(e);
      alert("Status update failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {pending ? `Updating ${pending}...` : `Status: ${status ?? "scheduled"}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Set status</DropdownMenuLabel>
        {ALLOWED.map((s) => (
          <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
            {s.replace("_", " ")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
