// components/medix/DashboardStats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, UserRound, Users } from "lucide-react";

type Stats = {
  revenue: number;
  revenueChange?: number;
  appointments: number;
  appointmentsChange?: number;
  appointmentsToday?: number;
  patients: number;
  patientsChange?: number;
  staff?: number;
  staffChange?: number;
};

export default function DashboardStats({
  stats,
  context = "clinic",
}: {
  stats: Stats;
  context?: "clinic" | "doctor";
}) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {/* Revenue */}
      {context === "clinic" && (
        <Card className="border bg-white dark:bg-background shadow-sm hover:shadow-md transition">
          <CardHeader className="flex flex-col items-start gap-1">
            <DollarSign className="h-6 w-6 text-green-600" />
            <CardTitle className="text-base font-semibold text-foreground">Total Revenue</CardTitle>
            <p className="text-muted-foreground text-sm">
              <span className={typeof stats.revenueChange === "number" && stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
                {typeof stats.revenueChange === "number" ? stats.revenueChange.toFixed(1) + "%" : "0%"}
              </span>{" "}
              from last month
            </p>
          </CardHeader>
          <CardContent className="mt-2 !pt-0">
            <h3 className="text-4xl font-bold">
              ${typeof stats.revenue === "number" ? stats.revenue.toLocaleString() : "0"}
            </h3>
          </CardContent>
        </Card>
      )}

      {/* Appointments */}
      <Card className="border bg-white dark:bg-background shadow-sm hover:shadow-md transition">
        <CardHeader className="flex flex-col items-start gap-1">
          <Calendar className="h-6 w-6 text-blue-500" />
          <CardTitle className="text-base font-semibold text-foreground">Appointments</CardTitle>
          <p className="text-muted-foreground text-sm">
            <span
              className={typeof stats.appointmentsChange === "number" && stats.appointmentsChange >= 0 ? "text-green-600" : "text-red-600"}
            >
              {typeof stats.appointmentsChange === "number" ? stats.appointmentsChange.toFixed(1) + "%" : "0%"}
            </span>{" "}
            from last month
          </p>
        </CardHeader>
        <CardContent className="mt-2 !pt-0">
          <h3 className="text-4xl font-bold">{stats.appointments ?? 0}</h3>
        </CardContent>
      </Card>

      {/* Patients */}
      <Card className="border bg-white dark:bg-background shadow-sm hover:shadow-md transition">
        <CardHeader className="flex flex-col items-start gap-1">
          <UserRound className="h-6 w-6 text-amber-500" />
          <CardTitle className="text-base font-semibold text-foreground">Patients</CardTitle>
          <p className="text-muted-foreground text-sm">
            <span className={typeof stats.patientsChange === "number" && stats.patientsChange >= 0 ? "text-green-600" : "text-red-600"}>
              {typeof stats.patientsChange === "number" ? stats.patientsChange.toFixed(1) + "%" : "0%"}
            </span>{" "}
            from last month
          </p>
        </CardHeader>
        <CardContent className="mt-2 !pt-0">
          <h3 className="text-4xl font-bold">{stats.patients ?? 0}</h3>
        </CardContent>
      </Card>

      {/* Staff (doctor context-də “My Patients” və ya “This week”) kimi istifadə oluna bilər */}
      <Card className="border bg-white dark:bg-background shadow-sm hover:shadow-md transition">
        <CardHeader className="flex flex-col items-start gap-1">
          <Users className="h-6 w-6 text-purple-500" />
          <CardTitle className="text-base font-semibold text-foreground">
            {context === "clinic" ? "Staff" : "This Week"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            <span className={typeof stats.staffChange === "number" && stats.staffChange >= 0 ? "text-green-600" : "text-red-600"}>
              {typeof stats.staffChange === "number" ? stats.staffChange : 0}
            </span>{" "}
            {context === "clinic" ? "new this month" : "appointments"}
          </p>
        </CardHeader>
        <CardContent className="mt-2 !pt-0">
          <h3 className="text-4xl font-bold">{stats.staff ?? stats.appointmentsToday ?? 0}</h3>
        </CardContent>
      </Card>
    </div>
  );
}
