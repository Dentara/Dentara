"use client";

import { Badge } from "@/components/ui/badge";

export function DoctorCalendar({ upcomingAppointments = [] }: { upcomingAppointments?: any[] }) {
  // Gələcəkdə backend və ya props ilə doldurulacaq

  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  if (!upcomingAppointments.length) {
    return <div className="text-muted-foreground">No upcoming appointments.</div>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-4">
        {upcomingAppointments.map((appointment: any) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between gap-4 flex-wrap rounded-lg border p-2 md:p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{appointment.patientName || "--"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(appointment.date)} {appointment.time ? `at ${appointment.time}` : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {appointment.status && (
                <Badge
                  variant="outline"
                  className={
                    appointment.status === "confirmed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }
                >
                  {appointment.status}
                </Badge>
              )}
              {appointment.type && <Badge variant="secondary">{appointment.type}</Badge>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
