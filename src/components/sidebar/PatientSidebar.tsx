"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";

const items = [
  { href: "/dashboard/patient-self", label: "Overview" },
  { href: "/dashboard/patient-self/appointments", label: "Appointments" },
  { href: "/dashboard/patient-self/clinics", label: "Linked Clinics" },
  { href: "/dashboard/patient-self/grants", label: "Files" },
  { href: "/dashboard/patient-self/treatments", label: "Treatment History" },
  { href: "/dashboard/patient-self/profile", label: "Profile & Settings" },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const patientEmail = (session?.user?.email as string) || "";

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let stop = false;
    let timer: any;

    async function loadUnread() {
      if (stop) return;
      if (!patientEmail || status !== "authenticated") {
        setUnreadCount(0);
        return;
      }
      try {
        const r = await fetch(
          `/api/patient/notifications/unread-count?patientEmail=${encodeURIComponent(
            patientEmail
          )}`,
          { cache: "no-store" }
        );
        const j = r.ok ? await r.json() : { count: 0 };
        if (!stop) setUnreadCount(Number(j?.count || 0));
      } catch {
        if (!stop) setUnreadCount(0);
      }
    }

    // ilkin yükləmə
    loadUnread();
    // polling
    timer = setInterval(loadUnread, 30_000);

    return () => {
      stop = true;
      if (timer) clearInterval(timer);
    };
  }, [patientEmail, status]);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const myReqActive = isActive("/dashboard/patient-self/requests");

  return (
    <aside className="w-64 shrink-0 border-r bg-white dark:bg-neutral-900">
      <div className="px-4 py-4 text-lg font-semibold">Patient</div>

      <nav className="px-2 py-2 space-y-1">
        {/* My Requests + unread badge */}
        <Link
          href="/dashboard/patient-self/requests"
          className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
            myReqActive
              ? "bg-blue-600 text-white"
              : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span>My Requests</span>
          </span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full px-2 py-0.5">
              {unreadCount}
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
