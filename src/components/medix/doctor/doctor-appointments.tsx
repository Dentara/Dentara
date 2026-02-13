"use client";

import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DoctorAppointments({ appointments = [] }: { appointments?: any[] }) {
  // appointments props və ya gələcəkdə backend-dən data kimi istifadə olunacaq

  if (!appointments.length) {
    return <div className="text-muted-foreground">No appointments scheduled.</div>;
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex items-center justify-between gap-4 flex-wrap rounded-lg border p-3 transition-all hover:bg-accent"
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={appointment.patient?.avatar || "/user-2.png"} alt={appointment.patient?.name || ""} />
              <AvatarFallback>{appointment.patient?.initials || "--"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{appointment.patient?.name || "--"}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {appointment.time || "--"} {appointment.duration && `• ${appointment.duration}`}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={appointment.status === "In Progress" ? "default" : "outline"}>
              {appointment.type || "--"}
            </Badge>
            <Button size="sm" variant="outline">
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
