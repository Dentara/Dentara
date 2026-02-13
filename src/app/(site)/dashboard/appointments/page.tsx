"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, Clock, Download, Filter, MoreHorizontal, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type AppointmentRow = {
  id: string;
  patient: { name: string; image?: string };
  doctor: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: string; // TitleCase
  type: string;
  duration: string | number | null;
  department: string;
  toothNumber?: string;
  procedureType?: string;
  price?: string | number | null;
};

function getUniqueValues<T>(data: T[], key: keyof T | string): string[] {
  const keyStr = String(key);
  return [...new Set(
    data.map((item) => {
      if (keyStr.includes(".")) {
        const [parent, child] = keyStr.split(".");
        return (item as any)[parent]?.[child];
      }
      return (item as any)[keyStr];
    })
  )].filter(Boolean) as string[];
}

const badgeVariant = (status: string) => {
  switch (status) {
    case "Confirmed":   return { variant: "outline", className: "border-blue-500 text-blue-500" };
    case "In progress": return { variant: "default", className: "bg-amber-500" };
    case "Completed":   return { variant: "success", className: "bg-green-500" };
    case "Cancelled":   return { variant: "destructive", className: "bg-red-500" };
    default:            return { variant: "outline", className: "" };
  }
};

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentRow[]>([]);
  const [filters, setFilters] = useState<any>({
    status: [],
    type: [],
    doctor: [],
    department: [],
    duration: [],
    toothNumber: [],
    procedureType: [],
  });
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: session } = useSession();
  const clinicId = (session?.user as any)?.clinicId;

  useEffect(() => {
   (async () => {
     try {
       const base = `/api/clinic/appointments?from=2000-01-01&to=2100-01-01`;
       const withClinic = clinicId ? `${base}&clinicId=${encodeURIComponent(clinicId)}` : base;

       // 1) clinicId ilə cəhd et (əgər var)
       let res = await fetch(withClinic, { cache: "no-store" });
       let data = await res.json();

       // 2) boş gələrsə və clinicId var idisə → fallback (clinic filter-siz)
       if (Array.isArray(data) && data.length === 0 && clinicId) {
         const res2 = await fetch(base, { cache: "no-store" });
         const data2 = await res2.json();
         if (Array.isArray(data2)) data = data2;
       }

       const normalized: AppointmentRow[] = (Array.isArray(data) ? data : []).map((a: any) => ({
         id: a.id,
         patient: {
           name: a.patient?.name ?? a.patientName ?? "Unknown",
           image: a.patient?.image ?? "",
         },
         doctor: a.doctor?.fullName ?? a.doctorName ?? "Dr. Unknown",
         date: a.date
           ? (typeof a.date === "string" ? a.date.slice(0, 10) : new Date(a.date).toISOString().slice(0, 10))
           : "",
         time: a.time ?? a.startTime ?? "",
         status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : "Scheduled",
         type: a.type ?? "",
         duration: a.duration ?? "",
         department: a.department ?? "",
         toothNumber: a.toothNumber ?? "",
         procedureType: a.procedureType ?? "",
         price: a.price ?? "",
       }));

       setAppointments(normalized);
     } catch (err) {
       console.error("Failed to fetch appointments", err);
     }
   })();
 }, [clinicId]);


  /* Options */
  const statusOptions = useMemo(() => getUniqueValues(appointments, "status"), [appointments]);
  const typeOptions = useMemo(() => getUniqueValues(appointments, "type"), [appointments]);
  const doctorOptions = useMemo(() => getUniqueValues(appointments, "doctor"), [appointments]);
  const departmentOptions = useMemo(() => getUniqueValues(appointments, "department"), [appointments]);
  const durationOptions = useMemo(() => getUniqueValues(appointments, "duration"), [appointments]);
  const toothNumberOptions = useMemo(() => getUniqueValues(appointments, "toothNumber"), [appointments]);
  const procedureTypeOptions = useMemo(() => getUniqueValues(appointments, "procedureType"), [appointments]);

  /* Filtering */
  useEffect(() => {
    let result = [...appointments];

    if (activeTab === "upcoming") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((a) => new Date(a.date) > today && a.status !== "Cancelled");
    } else if (activeTab === "today") {
      const today = new Date().toISOString().split("T")[0];
      result = result.filter((a) => a.date === today);
    } else if (activeTab === "completed") {
      result = result.filter((a) => a.status === "Completed");
    } else if (activeTab === "cancelled") {
      result = result.filter((a) => a.status === "Cancelled");
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.patient.name.toLowerCase().includes(s) ||
          a.doctor.toLowerCase().includes(s) ||
          a.type.toLowerCase().includes(s) ||
          a.department.toLowerCase().includes(s)
      );
    }

    let hasActiveFilters = false;

    (["status", "type", "doctor", "department", "duration", "toothNumber", "procedureType"] as const).forEach((key) => {
      const list = (filters as any)[key];
      if (list?.length) {
        result = result.filter((a: any) => list.includes((a as any)[key] || (a as any)[key]?.toString?.()));
        hasActiveFilters = true;
      }
    });

    setIsFiltersApplied(hasActiveFilters);
    setFilteredAppointments(result);
  }, [activeTab, searchTerm, filters, appointments]);

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters((prev: any) => {
      const next = { ...prev };
      const exists = next[filterType].includes(value);
      next[filterType] = exists
        ? next[filterType].filter((x: any) => x !== value)
        : [...next[filterType], value];
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      type: [],
      doctor: [],
      department: [],
      duration: [],
      toothNumber: [],
      procedureType: [],
    });
    setSearchTerm("");
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Appointments</h2>
            <p className="text-muted-foreground">Manage your clinic&apos;s appointments and schedules.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/appointments/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/appointments/add">
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Appointments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          {["all", "upcoming", "today", "completed", "cancelled"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="mb-3">
                      {tabValue === "all" && "All Appointments"}
                      {tabValue === "upcoming" && "Upcoming Appointments"}
                      {tabValue === "today" && "Today's Appointments"}
                      {tabValue === "completed" && "Completed Appointments"}
                      {tabValue === "cancelled" && "Cancelled Appointments"}
                    </CardTitle>
                    <CardDescription>
                      {tabValue === "all" && "View and manage all scheduled appointments."}
                      {tabValue === "upcoming" && "View and manage future scheduled appointments."}
                      {tabValue === "today" && "View and manage appointments scheduled for today."}
                      {tabValue === "completed" && "View all completed appointments."}
                      {tabValue === "cancelled" && "View all cancelled appointments."}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search appointments..."
                        className="pl-8 w-full md:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setSearchTerm("")}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Clear search</span>
                        </Button>
                      )}
                    </div>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={isFiltersApplied ? "default" : "outline"} size="icon" className={isFiltersApplied ? "bg-primary text-primary-foreground" : ""}>
                          <Filter className="h-4 w-4" />
                          <span className="sr-only">Filter</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="end">
                        <div className="p-4 border-b">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Filters</h4>
                            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!isFiltersApplied && !searchTerm}>
                              Reset
                            </Button>
                          </div>
                        </div>
                        <ScrollArea className="h-[300px]">
                          <div className="p-4 space-y-4">
                            <div>
                              <h5 className="font-medium mb-2">Status</h5>
                              <div className="space-y-2">
                                {statusOptions.map((status) => {
                                  const meta = badgeVariant(status);
                                  return (
                                    <div key={status} className="flex items-center space-x-2">
                                      <Checkbox id={`status-${status}`} checked={filters.status.includes(status)} onCheckedChange={() => handleFilterChange("status", status)} />
                                      <Label htmlFor={`status-${status}`} className="flex items-center">
                                        <Badge variant={meta.variant as any} className={`${meta.className} mr-2`}>{status}</Badge>
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Appointment Type</h5>
                              <div className="space-y-2">
                                {typeOptions.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox id={`type-${type}`} checked={filters.type.includes(type)} onCheckedChange={() => handleFilterChange("type", type)} />
                                    <Label htmlFor={`type-${type}`}>{type}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Doctor</h5>
                              <div className="space-y-2">
                                {doctorOptions.map((doctor) => (
                                  <div key={doctor} className="flex items-center space-x-2">
                                    <Checkbox id={`doctor-${doctor}`} checked={filters.doctor.includes(doctor)} onCheckedChange={() => handleFilterChange("doctor", doctor)} />
                                    <Label htmlFor={`doctor-${doctor}`}>{doctor}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Department</h5>
                              <div className="space-y-2">
                                {departmentOptions.map((department) => (
                                  <div key={department} className="flex items-center space-x-2">
                                    <Checkbox id={`department-${department}`} checked={filters.department.includes(department)} onCheckedChange={() => handleFilterChange("department", department)} />
                                    <Label htmlFor={`department-${department}`}>{department}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Duration</h5>
                              <div className="space-y-2">
                                {durationOptions.map((duration) => (
                                  <div key={duration} className="flex items-center space-x-2">
                                    <Checkbox id={`duration-${duration}`} checked={filters.duration.includes(duration)} onCheckedChange={() => handleFilterChange("duration", duration)} />
                                    <Label htmlFor={`duration-${duration}`}>{duration}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Tooth Number</h5>
                              <div className="space-y-2">
                                {toothNumberOptions.map((tooth) => (
                                  <div key={tooth} className="flex items-center space-x-2">
                                    <Checkbox id={`tooth-${tooth}`} checked={filters.toothNumber.includes(tooth)} onCheckedChange={() => handleFilterChange("toothNumber", tooth)} />
                                    <Label htmlFor={`tooth-${tooth}`}>{tooth}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Procedure Type</h5>
                              <div className="space-y-2">
                                {procedureTypeOptions.map((procedure) => (
                                  <div key={procedure} className="flex items-center space-x-2">
                                    <Checkbox id={`procedure-${procedure}`} checked={filters.procedureType.includes(procedure)} onCheckedChange={() => handleFilterChange("procedureType", procedure)} />
                                    <Label htmlFor={`procedure-${procedure}`}>{procedure}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>

                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead className="table-cell">Doctor</TableHead>
                        <TableHead>{tabValue === "today" ? "Time" : "Date & Time"}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="table-cell">Type</TableHead>
                        <TableHead className="table-cell">Duration</TableHead>
                        <TableHead className="table-cell">Tooth</TableHead>
                        <TableHead className="table-cell">Procedure</TableHead>
                        <TableHead className="table-cell">Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="whitespace-nowrap">
                      {filteredAppointments.map((a) => {
                        const meta = badgeVariant(a.status);
                        return (
                          <TableRow key={a.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={a.patient.image || "/user-2.png"} alt={a.patient.name} />
                                  <AvatarFallback>{a.patient.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{a.patient.name}</p>
                                  <p className="text-sm text-muted-foreground md:hidden">{a.doctor}</p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="table-cell">{a.doctor}</TableCell>

                            <TableCell>
                              <div>
                                {tabValue !== "today" && <p>{a.date}</p>}
                                <p className={`text-sm ${tabValue === "today" ? "" : "text-muted-foreground"}`}>{a.time}</p>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant={meta.variant as any} className={meta.className}>
                                {a.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="table-cell">{a.type}</TableCell>
                            <TableCell className="table-cell">{a.duration}</TableCell>
                            <TableCell className="table-cell">{a.toothNumber}</TableCell>
                            <TableCell className="table-cell">{a.procedureType}</TableCell>
                            <TableCell className="table-cell">{a.price ? `${a.price} ₼` : ""}</TableCell>

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/appointments/${a.id}`}>View details</Link>
                                  </DropdownMenuItem>

                                  {a.status !== "Completed" && a.status !== "Cancelled" && (
                                    <>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/appointments/${a.id}/edit`}>Edit appointment</Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/appointments/${a.id}/reschedule`}>Reschedule</Link>
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {a.status === "Confirmed" && (
                                    <DropdownMenuItem>
                                      <Check className="mr-2 h-4 w-4" /> Mark as in progress
                                    </DropdownMenuItem>
                                  )}

                                  {a.status === "In progress" && (
                                    <DropdownMenuItem>
                                      <Check className="mr-2 h-4 w-4" /> Mark as completed
                                    </DropdownMenuItem>
                                  )}

                                  {a.status === "Completed" && (
                                    <>
                                      <DropdownMenuItem>View medical record</DropdownMenuItem>
                                      <DropdownMenuItem>Create follow-up</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>Generate invoice</DropdownMenuItem>
                                    </>
                                  )}

                                  {a.status === "Cancelled" && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/appointments/${a.id}/reschedule`}>Reschedule appointment</Link>
                                    </DropdownMenuItem>
                                  )}

                                  {a.status !== "Cancelled" && a.status !== "Completed" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setCancelDialogOpen(true)} className="text-red-600">
                                        Cancel appointment
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {a.status === "Cancelled" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">Delete permanently</DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {filteredAppointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      {searchTerm || isFiltersApplied ? (
                        <>
                          <Filter className="h-12 w-12 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-semibold">No matching appointments</h3>
                          <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                          <Button variant="outline" className="mt-4" onClick={clearFilters}>
                            Clear all filters
                          </Button>
                        </>
                      ) : (
                        <>
                          {tabValue === "all" && (
                            <>
                              <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                              <h3 className="text-lg font-semibold">No appointments</h3>
                              <p className="text-muted-foreground">There are no appointments to display.</p>
                            </>
                          )}
                          {tabValue === "upcoming" && (
                            <>
                              <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                              <h3 className="text-lg font-semibold">No upcoming appointments</h3>
                              <p className="text-muted-foreground">There are no upcoming appointments scheduled.</p>
                            </>
                          )}
                          {tabValue === "today" && (
                            <>
                              <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                              <h3 className="text-lg font-semibold">No appointments today</h3>
                              <p className="text-muted-foreground">There are no appointments scheduled for today.</p>
                            </>
                          )}
                          {tabValue === "completed" && (
                            <>
                              <Check className="h-12 w-12 text-muted-foreground mb-2" />
                              <h3 className="text-lg font-semibold">No completed appointments</h3>
                              <p className="text-muted-foreground">There are no completed appointments to display.</p>
                            </>
                          )}
                          {tabValue === "cancelled" && (
                            <>
                              <X className="h-12 w-12 text-muted-foreground mb-2" />
                              <h3 className="text-lg font-semibold">No cancelled appointments</h3>
                              <p className="text-muted-foreground">There are no cancelled appointments to display.</p>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The patient will be notified.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => setCancelDialogOpen(false)} className="bg-red-500 text-neutral-50 hover:bg-red-600">
              Cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
