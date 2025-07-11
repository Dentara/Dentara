"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Clock, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function RecentAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/clinic/appointments/recent");
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  return (
    <>
      <div className="space-y-4">
        {appointments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">No recent appointments found.</p>
        )}
        {appointments.map((appointment) => ( 
          <div key={appointment.id} className="flex items-center justify-between flex-wrap gap-3 rounded-md border p-2 md:p-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Avatar>
                <AvatarImage src={appointment.patient.image || "/user-2.png"} alt={appointment.patient.name} />
                <AvatarFallback>{appointment.patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none mb-2">{appointment.patient.name}</p>
                <p className="text-sm text-muted-foreground">{appointment.type}</p>
                <div className="flex items-center pt-1 gap-1 flex-wrap">
                  <div className="flex items-center sm:gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{appointment.date}</span>
                  </div>
                  <div className="flex items-center sm:gap-1">
                    <Clock className=" h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{appointment.time}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Badge
                variant={appointment.status === "Confirmed" ? "outline" : appointment.status === "In Progress" ? "default" : appointment.status === "Completed" ? "success" : "destructive"}
                className={appointment.status === "Confirmed" ? "border-blue-500 text-blue-500" : appointment.status === "In Progress" ? "bg-amber-500" : appointment.status === "Completed" ? "bg-green-500" : "bg-red-500"}
              >
                {appointment.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href={`/appointments/1`}>View details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`/appointments/1/edit`}>Edit appointment</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCancelDialogOpen(true)}>Cancel appointment</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        <Button href="/appointments" variant="link" size="sm" className="w-full">View all appointments</Button>
      </div>
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>This action is irreversible. If you cancel the appointment, the patient will be notified and the appointment will be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelDialogOpen(false)}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => setCancelDialogOpen(false)} className="bg-red-500 text-neutral-50 hover:bg-red-600">
              Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
