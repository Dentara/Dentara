"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Ambulance, BarChart3, Bed, Building2, Calendar, Calendar1, CheckCircle2, Droplet, FileText, Grid, HelpCircle, LayoutDashboard, LucideHeart, Mail, MessageCircle, MessageSquare, Package, Pill, Receipt, Settings, ShieldCheck, Star, UserCog, UserRound, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import AnimateHeight from "react-animate-height";
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: { title: string; href: string }[];
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      submenu: [
        { title: "Admin Dashboard", href: "/" },
        { title: "Doctor Dashboard", href: "/doctor-dashboard" },
        { title: "Patient Dashboard", href: "/patient-dashboard" },
      ],
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
      title: "Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
      submenu: [
        { title: "All Appointments", href: "/dashboard/appointments" },
        { title: "Add Appointment", href: "/dashboard/appointments/add" },
        { title: "Calendar View", href: "/dashboard/appointments/calendar" },
        { title: "Appointment Requests", href: "/dashboard/appointments/requests" },
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
    {
      title: "Ambulance",
      href: "/dashboard/ambulance",
      icon: Ambulance,
      submenu: [
        { title: "Ambulance Call List", href: "/ambulance/calls" },
        { title: "Ambulance List", href: "/ambulance/list" },
        { title: "Ambulance Details", href: "/ambulance/details" },
      ],
    },
    {
      title: "Pharmacy",
      href: "/dashboard/pharmacy/medicines",
      icon: Pill,
    },
    {
      title: "Blood Bank",
      href: "/dashboard/blood-bank",
      icon: Droplet,
      submenu: [
        { title: "Blood Stock", href: "/blood-bank/stock" },
        { title: "Blood Donor", href: "/blood-bank/donors" },
        { title: "Blood Issued", href: "/blood-bank/issued" },
        { title: "Add Blood Unit", href: "/blood-bank/add" },
        { title: "Issue Blood", href: "/blood-bank/issue" },
      ],
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: Receipt,
      submenu: [
        { title: "Invoices List", href: "/billing" },
        { title: "Create Invoice", href: "/billing/create" },
        { title: "Payments History", href: "/billing/payments" },
        { title: "Insurance Claims", href: "/billing/insurance" },
      ],
    },
    {
      title: "Departments",
      href: "/dashboard/departments",
      icon: Building2,
      submenu: [
        { title: "Department List", href: "/departments" },
        { title: "Add Department", href: "/departments/add" },
        { title: "Services Offered", href: "/departments/services" },
      ],
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
      submenu: [
        { title: "Inventory List", href: "/inventory" },
        { title: "Add Item", href: "/inventory/add" },
        { title: "Stock Alerts", href: "/inventory/alerts" },
        { title: "Suppliers List", href: "/inventory/suppliers" },
      ],
    },
    {
      title: "Staff",
      href: "/dashboard/staff",
      icon: UserCog,
      submenu: [
        { title: "All Staff", href: "/staff" },
        { title: "Add Staff", href: "/staff/add" },
        { title: "Roles & Permissions", href: "/staff/roles" },
        { title: "Attendance", href: "/staff/attendance" },
      ],
    },
    {
      title: "Records",
      href: "/dashboard/records",
      icon: FileText,
      submenu: [
        { title: "Birth Records", href: "/records/birth" },
        { title: "Death Records", href: "/records/death" },
      ],
    },
    {
      title: "Room Allotment",
      href: "/dashboard/rooms",
      icon: Bed,
      submenu: [
        { title: "Alloted Rooms", href: "/rooms/alloted" },
        { title: "New Allotment", href: "/rooms/new" },
        { title: "Rooms by Department", href: "/rooms/departments" },
        { title: "Add New Room", href: "/rooms/add" },
      ],
    },
    {
      title: "Reviews",
      href: "/dashboard/reviews",
      icon: Star,
      submenu: [
        { title: "Doctor Reviews", href: "/reviews/doctors" },
        { title: "Patient Reviews", href: "/reviews/patients" },
      ],
    },
    {
      title: "Feedback",
      href: "/dashboard/feedback",
      icon: MessageSquare,     
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      submenu: [
        { title: "Overview", href: "/reports" },
        { title: "Appointment Reports", href: "/reports/appointments" },
        { title: "Financial Reports", href: "/reports/financial" },
        { title: "Inventory Reports", href: "/reports/inventory" },
        { title: "Patient Visit Reports", href: "/reports/patients" },
      ],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      submenu: [
        { title: "General Settings", href: "/settings" },
        { title: "Notifications", href: "/settings/notifications" },
        { title: "Working Hours", href: "/settings/hours" },
        { title: "Integrations", href: "/settings/integrations" },
      ],
    },
    {
      title: "Authentication",
      href: "/dashboard/auth",
      icon: ShieldCheck,
      submenu: [
        { title: "Login", href: "/auth/login" },
        { title: "Register", href: "/auth/register" },
        { title: "Forgot Password", href: "/auth/forgot-password" },
        { title: "Profile Settings", href: "/profile" },
      ],
    },

    {
      title:"Calendar",
      href:"/calendar",
      icon: Calendar1,
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: CheckCircle2,
    },
    {
      title: "Contacts",
      href: "/contact",
      icon: UserRound,
    },
    {
      title: "Email",
      href: "/email",
      icon: Mail,
    },
    {
      title: "Chat",
      href: "/chat",
      icon: MessageCircle,
    },
    {
      title: "Support",
      href: "/support",
      icon: HelpCircle,
    },
    {
      title: "Widgets",
      href: "/widgets",
      icon: Grid,
    },
  ];

  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(title);
    }
  };

  const sidebarClasses = cn("!fixed xl:top-16 !overflow-y-auto max-xl:h-full left-0 bottom-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out", {
    "translate-x-0": isOpen,
    "-translate-x-full": !isOpen && isMobile,
    "translate-x-0 ": isOpen && !isMobile,
  });
  useEffect(() => {
    const foundItem = sidebarItems.find((item) => {
      if (item.submenu) {
        return item.submenu.some((subItem) => pathname === subItem.href);
      }
      return pathname === item.href;
    });
    if (foundItem?.submenu) {
      setOpenSubmenu(foundItem.title);
    }
  }, []);
  return (
    <aside className={sidebarClasses}>
      {isMobile && (
        <div className="flex py-3 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <LucideHeart size={24} />
            <span className="font-bold inline-block">MedixPro</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="size-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      )}
      <div className="flex-1 py-2  border-t">
        <nav className="space-y-1 px-2 ">
          {sidebarItems.map((item) => (
            <div key={item.title} className="space-y-1 custom-scrollbar">
              {item.submenu ? (
                <>
                  <button onClick={() => toggleSubmenu(item.title)} className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors", item.href !== '/' && pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", pathname=="/" && item.href=="/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
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
                              "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            onClick={() => isMobile && setIsOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        )
                      )}
                    </div>
                  </AnimateHeight>

                </>
              ) : (
                <Link href={item.href} className={cn("flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors", pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")} onClick={() => isMobile && setIsOpen(false)}>
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
            <AvatarImage src="/placeholder-user.jpg" alt="Dr. Sarah Johnson" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Dr. Sarah Johnson</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
