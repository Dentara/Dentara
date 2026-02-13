//components/medix/sidebar.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  Inbox,
  LayoutDashboard,
  Pill,
  UserRound,
  Users,
  X,
  LucideHeart,
  Building2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import AnimateHeight from "react-animate-height";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: { title: string; href: string; onClick?: () => void }[];
}

// Kiçik util: adın baş hərfləri
function initials(name?: string | null) {
  const n = (name || "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || parts[0]?.[1] || "";
  return (a + b).toUpperCase();
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMobile();
  const { data: session } = useSession();

  // SESSION-dan real ad/şəkil
  const userName = (session?.user?.name as string) || "User";
  const userImage = (session?.user?.image as string) || "";

  const user = session?.user as any;
  const clinicId =
    user?.role === "clinic"
      ? (user?.id as string | undefined)
      : (user?.clinicId as string | undefined);


  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // ---- Real-time badge: SSE (EventSource)
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Klinikası olmayan sessiya üçün badge 0
    if (!clinicId) {
      setPendingCount(0);
      return;
    }

    // Önceki əlaqəni bağla
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const url = `/api/clinic/appointments/requests/stream?clinicId=${encodeURIComponent(
      clinicId,
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
        // ignore
      }
    };
    es.onerror = () => {
      // SSE kəsilərsə: 2 saniyə sonra yenidən bağlan
      try {
        es.close();
      } catch {}
      esRef.current = null;
      setTimeout(() => {
        if (!esRef.current && clinicId) {
          const retry = new EventSource(
            `/api/clinic/appointments/requests/stream?clinicId=${encodeURIComponent(clinicId)}`,
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
  }, [clinicId]);

  const isRequestsActive = pathname === "/dashboard/clinic/requests";

  // ---- Menu items (Appointments altındakı köhnə "Appointment Requests" linkini çıxartdıq)
  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      submenu: [
        { title: "Admin Dashboard", href: "/" },
        //{ title: "Doctor Dashboard", href: "/dashboard/doctor-dashboard" },
        //{ title: "Patient Dashboard", href: "/dashboard/patient-dashboard" },
      ],
    },
    {
      title: "Clinic Profile",
      href: "/dashboard/clinic/profile",
      icon: Building2,
    },
    {
      title: "Doctors",
      href: "/dashboard/doctors",
      icon: Users,
      submenu: [
        { title: "Doctors List", href: "/dashboard/doctors" },
        { title: "Add Doctor", href: "/dashboard/doctors/add" },
        { title: "Doctor Schedule", href: "/dashboard/doctors/schedule" },
        { title: "Specializations", href: "/dashboard/doctors/specializations" },
      ],
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: UserRound,
    },

    {
      title: "Patient Files",
      href: "/dashboard/patient-files", // qısa yol: siyahıdan Files-ə keçid
      icon: FileText,
    },
    {
      title: "Add Treatment",
      href: "/dashboard/clinic/treatments",
      icon: Pill,
    },
    {
      title: "Patient Treatment History",
      href: "/dashboard/clinic/patient-treatments",
      icon: FileText,
    },
    {
      title: "Reviews",
      href: "/dashboard/clinic/reviews",
      icon: UserRound,
    },
    {
      title: "Security Log",
      href: "/dashboard/clinic/security-log",
      icon: Shield,
    },
    {
      title: "Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
      submenu: [
        { title: "All Appointments", href: "/dashboard/appointments" },
        { title: "Add Appointment", href: "/dashboard/appointments/add" },
        { title: "Calendar View", href: "/dashboard/appointments/calendar" },
        // Top-level Requests artıq aşağıda ayrıca var
      ],
    },
    {
      title: "Dental Records",
      href: "#",
      icon: FileText,
      submenu: [
        {
          title: "Dental Chart",
          href: "#",
          onClick: () => {
            const id = localStorage.getItem("activePatientId");
            if (id) window.location.href = `/dashboard/patients/${id}/dental-chart`;
          },
        },
        {
          title: "Dental Procedures",
          href: "#",
          onClick: () => {
            const id = localStorage.getItem("activePatientId");
            if (id) window.location.href = `/dashboard/patients/${id}/dental-procedures`;
          },
        },
      ],
    },
    {
      title: "Prescriptions",
      href: "/dashboard/prescriptions",
      icon: Pill,
      submenu: [
        { title: "All Prescriptions", href: "/dashboard/prescriptions" },
        { title: "Create Prescription", href: "/dashboard/prescriptions/create" },
        { title: "Medicine Templates", href: "/dashboard/prescriptions/templates" },
      ],
    },
  ];
    
  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) setOpenSubmenu(null);
    else setOpenSubmenu(title);
  };

  const sidebarClasses = cn(
    "!fixed xl:top-16 !overflow-y-auto max-xl:h-full left-0 bottom-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
    {
      "translate-x-0": isOpen,
      "-translate-x-full": !isOpen && isMobile,
      "translate-x-0 ": isOpen && !isMobile,
    },
  );

  useEffect(() => {
    const foundItem = sidebarItems.find((item) => {
      if (item.submenu) return item.submenu.some((s) => pathname === s.href);
      return pathname === item.href;
    });
    if (foundItem?.submenu) setOpenSubmenu(foundItem.title);
  }, []); // eslint-disable-line

  return (
    <aside className={sidebarClasses}>
      {isMobile && (
        <div className="flex py-3 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
            <LucideHeart size={24} />
            <span className="font-bold inline-block">Dentara</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="size-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      )}

      <div className="flex-1 py-2 border-t">
        <nav className="space-y-1 px-2">
          {/* Top-level: Appointment Requests with real-time badge */}
          <Link
            href="/dashboard/clinic/requests"
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isRequestsActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="inline-flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              <span>Appointment Requests</span>
            </span>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="rounded-full px-2 py-0.5">
                {pendingCount}
              </Badge>
            )}
          </Link>

          {/* Rest of the menu */}
          {sidebarItems.map((item) => (
            <div key={item.title} className="space-y-1 custom-scrollbar">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      item.href !== "/" && pathname.startsWith(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      pathname === "/" && item.href === "/"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn("h-4 w-4 transition-transform", {
                        "rotate-180": openSubmenu === item.title,
                      })}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <AnimateHeight height={openSubmenu === item.title ? "auto" : 0}>
                    <div className="ml-4 space-y-1 pl-2 pt-1">
                      {item.submenu?.map((subItem) =>
                        subItem.href === "#" && typeof subItem.onClick === "function" ? (
                          <button
                            key={subItem.title}
                            onClick={subItem.onClick}
                            className={cn(
                              "flex items-center w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                              "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {subItem.title}
                          </button>
                        ) : (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                              pathname === subItem.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                            onClick={() => isMobile && setIsOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        ),
                      )}
                    </div>
                  </AnimateHeight>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {/* DEMO deyildi — indi real user şəkli */}
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback>{initials(userName)}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground">Clinic Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
