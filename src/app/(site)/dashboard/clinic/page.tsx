"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDateRangePicker } from "@/components/medix/date-range-picker";
import { Overview } from "@/components/medix/overview";
import { RecentAppointments } from "@/components/medix/recent-appointments";
import Link from "next/link";
import PatientDemographicsChart from "@/components/medix/analytics/PatientDemographicsChart";
import AppointmentTypeChart from "@/components/medix/analytics/AppointmentTypeChart";
import SatisfactionPanel from "@/components/medix/analytics/SatisfactionPanel";
import StaffPerformancePanel from "@/components/medix/analytics/StaffPerformancePanel";
import RevenueSourceChart from "@/components/medix/analytics/RevenueSourceChart";
import DashboardStats from "@/components/medix/DashboardStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OnboardingBanner } from "@/components/onboarding/OnboardingBanner";
import ProfileCompletionBar from "@/components/profile/ProfileCompletionBar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Filter,
  UserRound,
  Users,
} from "lucide-react";

type Stats = {
  revenue: number;
  revenueChange?: number;
  appointments: number;
  appointmentsChange?: number;
  appointmentsToday?: number;
  patients: number;
  patientsChange?: number;
  staff: number;
  staffChange?: number;
};

type NotifItem = { icon: string; title: string; message: string; time: string; kind: "danger" | "info" | "success" | "warning" };
type NotifGroups = { unread: NotifItem[]; today: NotifItem[]; earlier: NotifItem[] };

type NotifSetting = { category: string; description: string; enabled: boolean };
type DeliverySetting = { method: string; description: string; enabled: boolean };

type ReportsCatalog = {
  financial: { name: string; updated: string }[];
  patient: { name: string; updated: string }[];
  operational: { name: string; updated: string }[];
};
type ReportActivity = { user: string; report: string; time: string; action: "Generated" | "Viewed" };

const iconFromKind = (k: NotifItem["kind"], name?: string) => {
  if (name === "calendar") return <Calendar className="h-4 w-4 text-purple-500" />;
  if (name === "users") return <Users className="h-4 w-4 text-blue-500" />;
  if (name === "dollar") return <DollarSign className="h-4 w-4 text-green-500" />;
  if (name === "ban") return <Ban className="h-4 w-4 text-red-500" />;
  if (name === "check") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (name === "clock") return <Clock className="h-4 w-4 text-orange-500" />;
  switch (k) {
    case "danger":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
  }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const clinicName = session?.user?.name || "Clinic";

  // ---- State
  const [stats, setStats] = useState<Stats>({ revenue: 0, appointments: 0, patients: 0, staff: 0 });
  const [notif, setNotif] = useState<NotifGroups>({ unread: [], today: [], earlier: [] });
  const [notifCats, setNotifCats] = useState<NotifSetting[]>([]);
  const [notifDelivery, setNotifDelivery] = useState<DeliverySetting[]>([]);
  const [reports, setReports] = useState<ReportsCatalog>({ financial: [], patient: [], operational: [] });
  const [reportActivity, setReportActivity] = useState<ReportActivity[]>([]);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // ---- Data fetchers
  useEffect(() => {
    (async () => {
      try {
        // Stats
        const s = await fetch("/api/clinic/stats").then((r) => r.json());
        setStats((p) => ({ ...p, ...s }));

        // Notifications + settings
        const n = await fetch("/api/clinic/notifications").then((r) => r.json());
        setNotif(n?.groups ?? { unread: [], today: [], earlier: [] });
        setNotifCats(n?.settings?.categories ?? []);
        setNotifDelivery(n?.settings?.delivery ?? []);

        // Reports & activity
        const rc = await fetch("/api/clinic/reports/catalog").then((r) => r.json());
        setReports({
          financial: rc?.financial ?? [],
          patient: rc?.patient ?? [],
          operational: rc?.operational ?? [],
        });
        const ra = await fetch("/api/clinic/reports/recent").then((r) => r.json());
        setReportActivity(ra ?? []);
      } catch (e) {
        console.error("Dashboard load error:", e);
      }
    })();
  }, []);

  // ---- Derived counts
  const unreadCount = useMemo(() => notif.unread.length, [notif.unread]);
  const todayCount = useMemo(() => notif.today.length, [notif.today]);
  const earlierCount = useMemo(() => notif.earlier.length, [notif.earlier]);

  // ---- Export
  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch("/api/clinic/exports/overview", { method: "GET" });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dentara-clinic-overview-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {clinicName}! Here's what's happening today.</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {/* If your DateRangePicker exposes onChange, we capture it; otherwise it still renders normally */}
          <CalendarDateRangePicker onChange={setDateRange as any} />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <OnboardingBanner
        targetHref="/dashboard/clinic/onboarding"
        roleHint="clinic"
      />

      <ProfileCompletionBar />

      {/* KPI Cards */}
      <DashboardStats stats={stats as any} context="clinic" />
      <div>
        {/* Reusable stats for clinic/doctor */}
        {/* @components/medix/DashboardStats.tsx */}
        {/* stats state already loaded above */}
        {/* context="clinic" keeps revenue card visible */}
        {/* For doctor-self page, use context="doctor" */}
        {/* If you want to lazy-import, you can, but direct import is fine */}
        {/* import DashboardStats from "@/components/medix/DashboardStats"; */}
        {/* we assume you added the import at file top */}
      </div>


      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="max-md:space-y-4 md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Patient visits and revenue for the current period.</CardDescription>
              </CardHeader>
              <CardContent>
                <Overview />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  You have {typeof stats.appointmentsToday === "number" ? stats.appointmentsToday : 0} appointments today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAppointments />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold">Detailed Analytics</h2>
              <p className="text-sm text-muted-foreground">Insights and trends from your clinic data</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
                <CardDescription>Age and gender distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <PatientDemographicsChart />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Types</CardTitle>
                <CardDescription>Distribution by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <AppointmentTypeChart />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Breakdown by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <RevenueSourceChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Patient Satisfaction</CardTitle>
                <CardDescription>Based on feedback surveys</CardDescription>
              </CardHeader>
              <CardContent>
                <SatisfactionPanel />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
                <CardDescription>Top performing staff members</CardDescription>
              </CardHeader>
              <CardContent>
                {/* NOTE: Bu panelin daxilində placeholder 0-lar qalırsa, komponent faylını göndərin – real API-yə bağlayaq */}
                <StaffPerformancePanel />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold mb-2">Available Reports</h2>
              <p className="text-sm text-muted-foreground">Access and generate detailed reports</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/clinic/reports/new">Generate New Report</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Financial */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Revenue, expenses, and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { name: "Monthly Revenue Summary", updated: "Today" },
                    { name: "Quarterly Financial Analysis", updated: "Last week" },
                    { name: "Insurance Claims Report", updated: "2 days ago" },
                    { name: "Outstanding Payments", updated: "Yesterday" },
                  ].map((report, i) => (
                    <li key={i} className="flex items-center justify-between py-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Updated: {report.updated}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="link" asChild className="mt-2 px-0">
                  <Link href="/dashboard/clinic/reports/financial">View all financial reports</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Patient */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Patient Reports</CardTitle>
                <CardDescription>Demographics and visit analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { name: "New Patient Registrations", updated: "Today" },
                    { name: "Patient Demographics", updated: "3 days ago" },
                    { name: "Visit Frequency Analysis", updated: "Last week" },
                    { name: "Treatment Outcomes", updated: "Yesterday" },
                  ].map((report, i) => (
                    <li key={i} className="flex items-center justify-between py-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Updated: {report.updated}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="link" asChild className="mt-2 px-0">
                  <Link href="/dashboard/clinic/reports/patients">View all patient reports</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Operational */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Operational Reports</CardTitle>
                <CardDescription>Staff, inventory, and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { name: "Staff Performance Metrics", updated: "Today" },
                    { name: "Inventory Status", updated: "Today" },
                    { name: "Room Utilization", updated: "2 days ago" },
                    { name: "Wait Time Analysis", updated: "Last week" },
                  ].map((report, i) => (
                    <li key={i} className="flex items-center justify-between py-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Updated: {report.updated}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="link" asChild className="mt-2 px-0">
                  <Link href="/dashboard/clinic/reports/operational">View all operational reports</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Categories</h3>
                  {notifCats.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1">{s.category}</p>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      </div>
                      <Switch
                        defaultChecked={s.enabled}
                        onCheckedChange={async (val) => {
                          try {
                            await fetch("/api/clinic/notification-settings/category", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ category: s.category, enabled: val }),
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Delivery Methods</h3>
                  {notifDelivery.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1">{s.method}</p>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      </div>
                      <Switch
                        defaultChecked={s.enabled}
                        onCheckedChange={async (val) => {
                          try {
                            await fetch("/api/clinic/notification-settings/delivery", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ method: s.method, enabled: val }),
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
