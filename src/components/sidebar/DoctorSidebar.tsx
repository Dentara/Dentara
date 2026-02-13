"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Inbox } from "lucide-react";

import JoinClinicModal from "@/components/self/JoinClinicModal";
import { Badge } from "@/components/ui/badge";

// YENİ: Doktor üçün Add & History ayrıca göstərilir
const items = [
  { href: "/dashboard/doctor-self", label: "Overview" },
  { href: "/dashboard/doctor-self/appointments", label: "Appointments" },
  { href: "/dashboard/doctor-self/patients", label: "My Patients" },

  // Add-only səhifə
  { href: "/dashboard/doctor-self/treatments", label: "Add Treatment" },

  // Patient Treatment History (List + Detail entry point)
  { href: "/dashboard/doctor-self/patient-treatments", label: "Patient Treatment History" },

  { href: "/dashboard/doctor-self/records", label: "Clinical Records" },
  { href: "/dashboard/doctor-self/profile", label: "Profile & Settings" },
  { href: "/dashboard/doctor-self/reviews", label: "Reviews"}
];

export default function DoctorSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const doctorId = (session?.user as any)?.id as string | undefined;

  // --- Real-time pending count (SSE)
  const [pendingCount, setPendingCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setPendingCount(0);
      return;
    }

    if (esRef.current) {
      try {
        esRef.current.close();
      } catch {}
      esRef.current = null;
    }

    const url = `/api/clinic/appointments/requests/stream?doctorId=${encodeURIComponent(
      doctorId,
    )}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data || "{}");
        if (typeof data.count === "number") {
          setPendingCount(data.count);
        }
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      try {
        es.close();
      } catch {}
      esRef.current = null;
      // reconnection backoff (2s)
      setTimeout(() => {
        if (!esRef.current && doctorId) {
          const retry = new EventSource(
            `/api/clinic/appointments/requests/stream?doctorId=${encodeURIComponent(
              doctorId,
            )}`,
          );
          esRef.current = retry;
          retry.onmessage = es.onmessage;
          retry.onerror = es.onerror;
        }
      }, 2000);
    };

    return () => {
      try {
        es.close();
      } catch {}
      esRef.current = null;
    };
  }, [doctorId]);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const myRequestsActive = isActive("/dashboard/doctor-self/requests");

  return (
    <aside className="w-64 shrink-0 border-r bg-white dark:bg-neutral-900">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Doctor</div>
        {/* Sidebar-dan da Join Clinic açmaq üçün */}
        <div className="shrink-0">
          <JoinClinicModal triggerLabel="Join" defaultMode="inviteCode" />
        </div>
      </div>

      <nav className="px-2 py-2 space-y-1">
        {/* Top-level: My Requests with badge */}
        <Link
          href="/dashboard/doctor-self/requests"
          className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
            myRequestsActive
              ? "bg-blue-600 text-white"
              : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span>My Requests</span>
          </span>
          {pendingCount > 0 && (
            <Badge variant="destructive" className="rounded-full px-2 py-0.5">
              {pendingCount}
            </Badge>
          )}
        </Link>

        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block rounded px-3 py-2 text-sm ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
