"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, Clock, MoreHorizontal, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function DoctorSchedulePage() {
  const { id } = useParams();
  const doctorId = id as string;
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);

  useEffect(() => {
    // Fetch doctor details
    const fetchDoctor = async () => {
      const res = await fetch(`/api/doctors/${doctorId}`);
      if (res.ok) {
        setDoctor(await res.json());
      }
    };
    fetchDoctor();

    // Fetch doctor appointments
    const fetchAppointments = async () => {
      const res = await fetch(`/api/appointments?doctorId=${doctorId}`);
      const data = await res.json();
      setAppointments(data);
      setLoading(false);
    };
    fetchAppointments();
  }, [doctorId]);

  // Unique appointment dates for dropdown
  const appointmentDates = Array.from(
    new Set(appointments.map((appt) => appt.date && appt.date.slice(0, 10)))
  ).filter(Boolean);

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter((appt) => appt.date && appt.date.slice(0, 10) === selectedDate);

  if (loading || !doctor) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/doctors/${doctorId}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Doctor Schedule</h1>
          <p className="text-muted-foreground">Manage schedule and appointments for {doctor.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Doctor Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={doctor.profilePhoto || "/user-2.png"} alt={doctor.fullName || "Doctor"} />
                <AvatarFallback>{doctor.fullName?.charAt(0) ?? "?"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
                <CardDescription>{doctor.specialization || "—"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Department</h3>
                <div className="text-xs">{doctor.department || "—"}</div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Contact</h3>
                <div className="text-xs font-medium">{doctor.email}</div>
                <div className="text-xs text-muted-foreground">{doctor.phone}</div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Experience</h3>
                <div className="text-xs">{doctor.experience ? `${doctor.experience} years` : "—"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Content */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Manage doctor's appointments and schedule</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentDates.length === 0 && (
                      <SelectItem value={new Date().toISOString().slice(0, 10)}>
                        {new Date().toLocaleDateString()}
                      </SelectItem>
                    )}
                    {appointmentDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {new Date(date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isAddingTimeSlot} onOpenChange={setIsAddingTimeSlot}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Appointment Slot</DialogTitle>
                      <DialogDescription>Create a new appointment slot for patients to book.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Input id="date" type="date" defaultValue={selectedDate} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start-time" className="text-right">
                          Start Time
                        </Label>
                        <Input id="start-time" type="time" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="duration" className="text-right">
                          Duration (minutes)
                        </Label>
                        <Input id="duration" type="number" min={10} max={120} defaultValue={30} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingTimeSlot(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddingTimeSlot(false)}>Add Slot</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="list">
                    <Users className="h-4 w-4 mr-2" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="whitespace-nowrap">
                      {filteredAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No appointments scheduled for this date.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={appointment.patient?.profilePhoto || "/user-2.png"} alt={appointment.patient?.fullName || "-"} />
                                  <AvatarFallback>{appointment.patient?.fullName?.charAt(0) ?? "-"}</AvatarFallback>
                                </Avatar>
                                <span>{appointment.patient?.fullName || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {appointment.date ? new Date(appointment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                            </TableCell>
                            <TableCell>{appointment.duration || "-"}</TableCell>
                            <TableCell>{appointment.type || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={appointment.status === "Confirmed" ? "default" : "outline"} className={appointment.status === "Confirmed" ? "bg-green-500" : ""}>
                                {appointment.status || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                  <DropdownMenuItem>Cancel appointment</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="calendar">
                  <div className="border rounded-md p-4 text-center text-muted-foreground">
                    <div className="mb-4">Calendar view is coming soon.</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
