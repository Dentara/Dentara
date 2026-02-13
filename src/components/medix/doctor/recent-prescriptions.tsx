"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, RefreshCw } from "lucide-react";

export function RecentPrescriptions({ prescriptions = [] }: { prescriptions?: any[] }) {
  // prescriptions backend və ya props ilə gələcək

  if (!prescriptions.length) {
    return <div className="text-muted-foreground">No recent prescriptions.</div>;
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <div key={prescription.id} className="rounded-lg border p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={prescription.patient?.avatar || "/user-2.png"} alt={prescription.patient?.name || "--"} />
                <AvatarFallback>{prescription.patient?.initials || "--"}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{prescription.patient?.name || "--"}</div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-1 h-3 w-3" />
              {prescription.date || "--"}
            </div>
          </div>
          <div className="mt-2">
            <ul className="list-inside list-disc space-y-1 text-sm">
              {prescription.medications?.length
                ? prescription.medications.map((med: string, index: number) => (
                    <li key={index}>{med}</li>
                  ))
                : <li>--</li>}
            </ul>
          </div>
          <div className="mt-3 flex justify-end space-x-2">
            <Button size="sm" variant="ghost">
              <FileText className="mr-2 h-3 w-3" />
              View
            </Button>
            <Button size="sm" variant="ghost">
              <RefreshCw className="mr-2 h-3 w-3" />
              Renew
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
