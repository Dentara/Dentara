"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RequestsNavItem({
  className,
}: {
  className?: string;
}) {
  const { data: session } = useSession();
  const clinicId = (session?.user as any)?.clinicId as string | undefined;

  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let stop = false;
    async function load() {
      if (!clinicId) {
        setCount(0);
        return;
      }
      try {
        const r = await fetch(
          `/api/clinic/appointments/requests?clinicId=${encodeURIComponent(
            clinicId
          )}&status=pending`,
          { cache: "no-store" }
        );
        const j = r.ok ? await r.json() : [];
        if (!stop) setCount(Array.isArray(j) ? j.length : 0);
      } catch {
        if (!stop) setCount(0);
      }
    }
    load();

    // opsional: 60s-də bir yenilə
    const t = setInterval(load, 60_000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [clinicId]);

  return (
    <Link
      href="/dashboard/clinic/requests"
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted",
        className
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Inbox className="h-4 w-4" />
        <span>Appointment Requests</span>
      </span>

      {count > 0 && (
        <Badge variant="destructive" className="rounded-full px-2 py-0.5">
          {count}
        </Badge>
      )}
    </Link>
  );
}
