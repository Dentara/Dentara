"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DoctorPatients({ patients = [] }: { patients?: any[] }) {
  // real xəstə siyahısı üçün props və ya backend-dən gələcək

  if (!patients.length) {
    return <div className="text-muted-foreground">No patients found.</div>;
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="flex items-center justify-between gap-4 flex-wrap rounded-lg border p-3 transition-all hover:bg-accent"
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={patient.avatar || "/user-2.png"} alt={patient.name || "--"} />
              <AvatarFallback>{patient.initials || "--"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{patient.name || "--"}</div>
              <div className="text-sm text-muted-foreground">
                {patient.age ? `${patient.age} yrs` : "--"} {patient.gender ? `• ${patient.gender}` : ""}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge
              variant={patient.status === "Urgent" ? "default" : "outline"}
              className={
                patient.status === "Urgent" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : ""
              }
            >
              {patient.status || "--"}
            </Badge>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                History
              </Button>
              <Button size="sm">Examine</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
