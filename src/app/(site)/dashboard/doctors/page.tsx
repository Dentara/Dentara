"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, MoreHorizontal, Plus, Search, X, RotateCcw, Trash2 } from "lucide-react";

type Doctor = {
  id: string;
  fullName: string;
  specialization?: string;
  status?: "Active" | "On Leave" | "Inactive";
  experience?: number | string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
};

export default function DoctorsPage() {
  const { data: session } = useSession();
  const clinicId = (session as any)?.user?.clinicId ?? null;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Confirm dialog (deactivate/activate/delete)
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState<"deactivate" | "activate" | "delete" | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Invite Doctor
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const experienceRanges = ["0-5 years", "5-10 years", "10-15 years", "15+ years"];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = (await res.json()) as Doctor[];
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean))) as string[],
    [doctors]
  );
  const statuses = useMemo(() => {
    const s = new Set<string>();
    doctors.forEach((d) => s.add((d.status as string) || "Active"));
    return Array.from(s);
  }, [doctors]);

  const filteredDoctors = doctors.filter((doctor) => {
    const years = Number.parseInt(String(doctor.experience ?? 0));
    const matchesSearch =
      searchQuery === "" ||
      doctor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialties.length === 0 || selectedSpecialties.includes(doctor.specialization || "");
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(doctor.status || "Active");
    const matchesExperience =
      selectedExperience.length === 0 ||
      (selectedExperience.includes("0-5 years") && years < 5) ||
      (selectedExperience.includes("5-10 years") && years >= 5 && years < 10) ||
      (selectedExperience.includes("10-15 years") && years >= 10 && years < 15) ||
      (selectedExperience.includes("15+ years") && years >= 15);

    return matchesSearch && matchesSpecialty && matchesStatus && matchesExperience;
  });

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedStatuses([]);
    setSelectedExperience([]);
    setActiveFilters(0);
  };
  const applyFilters = () => {
    const totalActiveFilters =
      selectedSpecialties.length + selectedStatuses.length + selectedExperience.length;
    setActiveFilters(totalActiveFilters);
    setIsFilterOpen(false);
  };

  const StatusBadge = ({ status }: { status?: Doctor["status"] }) => {
    const st = status || "Active";
    if (st === "Active")
      return <Badge className="bg-green-500/90 text-white text-xs px-3 py-1 rounded-full">Active</Badge>;
    if (st === "On Leave")
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs px-3 py-1 rounded-full">
          On Leave
        </Badge>
      );
    return <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full">Inactive</Badge>;
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    if (!clinicId) {
      alert("Clinic ID is missing on your session.");
      return;
    }
    setInviteLoading(true);
    try {
      const res = await fetch("/api/clinic/invite/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, clinicId }),
      });
      const data = await res.json();
      if (data?.ok) {
        alert("Invite sent successfully!");
        setInviteOpen(false);
        setInviteEmail("");
      } else {
        alert("Error: " + (data?.error || "Failed to invite doctor"));
      }
    } catch (e) {
      console.error("invite doctor error", e);
      alert("Unexpected error");
    } finally {
      setInviteLoading(false);
    }
  };

  // Unified action runner (deactivate/activate/delete) + optimistic update
  const runAction = async (doctorId: string, mode: "deactivate" | "activate" | "delete") => {
    setLoadingAction(true);
    try {
      if (mode === "delete") {
        const res = await fetch(`/api/doctors/${doctorId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
      } else {
        const newStatus = mode === "activate" ? "Active" : "Inactive";
        const res = await fetch(`/api/doctors/${doctorId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("Status change failed");
        setDoctors((prev) => prev.map((d) => (d.id === doctorId ? { ...d, status: newStatus as any } : d)));
      }
    } catch (e) {
      alert("Action failed");
    } finally {
      setLoadingAction(false);
      setConfirmId(null);
      setConfirmMode(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Doctors</h2>
            <p className="text-muted-foreground">Manage your medical staff and their information.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/doctors/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Doctor
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Doctor
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Doctors List</CardTitle>
              <CardDescription>A list of all doctors in your clinic with their details.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search doctors..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className={activeFilters > 0 ? "relative bg-primary/10" : ""}>
                    <Filter className="h-4 w-4" />
                    {activeFilters > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                    <span className="sr-only">Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="end">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-muted-foreground">
                        Reset
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Specialty</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {specialties.map((specialty) => (
                          <div key={specialty} className="flex items-center space-x-2">
                            <Checkbox
                              id={`specialty-${specialty}`}
                              checked={selectedSpecialties.includes(specialty)}
                              onCheckedChange={() =>
                                setSelectedSpecialties((prev) =>
                                  prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
                                )
                              }
                            />
                            <Label htmlFor={`specialty-${specialty}`} className="text-sm font-normal">
                              {specialty}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Status</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {statuses.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={() =>
                                setSelectedStatuses((prev) =>
                                  prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
                                )
                              }
                            />
                            <Label htmlFor={`status-${status}`} className="text-sm font-normal">
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Experience</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {experienceRanges.map((range) => (
                          <div key={range} className="flex items-center space-x-2">
                            <Checkbox
                              id={`experience-${range}`}
                              checked={selectedExperience.includes(range)}
                              onCheckedChange={() =>
                                setSelectedExperience((prev) =>
                                  prev.includes(range) ? prev.filter((e) => e !== range) : [...prev, range]
                                )
                              }
                            />
                            <Label htmlFor={`experience-${range}`} className="text-sm font-normal">
                              {range}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {activeFilters > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedSpecialties.map((specialty) => (
                  <Badge key={`badge-specialty-${specialty}`} variant="outline" className="flex items-center gap-1">
                    {specialty}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setSelectedSpecialties((p) => p.filter((s) => s !== specialty));
                      setActiveFilters((prev) => prev - 1);
                    }}/>
                  </Badge>
                ))}
                {selectedStatuses.map((status) => (
                  <Badge key={`badge-status-${status}`} variant="outline" className="flex items-center gap-1">
                    {status}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setSelectedStatuses((p) => p.filter((s) => s !== status));
                      setActiveFilters((prev) => prev - 1);
                    }}/>
                  </Badge>
                ))}
                {selectedExperience.map((exp) => (
                  <Badge key={`badge-exp-${exp}`} variant="outline" className="flex items-center gap-1">
                    {exp}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setSelectedExperience((p) => p.filter((e) => e !== exp));
                      setActiveFilters((prev) => prev - 1);
                    }}/>
                  </Badge>
                ))}
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                    Clear all
                  </Button>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Speciality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No doctors found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={doctor.profilePhoto || "/user-2.png"} alt={doctor.fullName || "Doctor"} />
                              <AvatarFallback>{doctor.fullName?.charAt(0) ?? "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-base">{doctor.fullName}</div>
                              <div className="text-xs text-muted-foreground">{doctor.specialization || "—"}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {/* Dinamik status badge */}
                          <StatusBadge status={doctor.status} />
                        </TableCell>

                        <TableCell>
                          <span>{doctor.experience ? `${doctor.experience} years` : "—"}</span>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium">{doctor.email}</div>
                          <div className="text-xs text-muted-foreground">{doctor.phone}</div>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/doctors/${doctor.id}`}>View profile</Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/doctors/${doctor.id}/edit`}>Edit details</Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/doctors/${doctor.id}/schedule`}>View schedule</Link>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Statusa görə menyu elementləri */}
                              {doctor.status !== "Inactive" ? (
                                <DropdownMenuItem
                                  onClick={() => { setConfirmId(doctor.id); setConfirmMode("deactivate"); }}
                                  className="text-red-600"
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => { setConfirmId(doctor.id); setConfirmMode("activate"); }}
                                    className="text-green-600"
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" /> Activate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => { setConfirmId(doctor.id); setConfirmMode("delete"); }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified confirm dialog */}
      <AlertDialog open={!!confirmId} onOpenChange={() => { setConfirmId(null); setConfirmMode(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmMode === "delete" ? "Delete doctor?" : confirmMode === "activate" ? "Activate doctor?" : "Deactivate doctor?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMode === "delete"
                ? "This will permanently remove the doctor from this clinic. This action cannot be undone."
                : confirmMode === "activate"
                ? "The doctor will be visible as Active again."
                : "The doctor will be marked as Inactive. An employment archive record will be created."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmId(null); setConfirmMode(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmMode === "delete"
                  ? "bg-red-600 text-white"
                  : confirmMode === "activate"
                  ? "bg-green-600 text-white"
                  : "bg-red-500 text-white"
              }
              disabled={loadingAction}
              onClick={() => confirmId && confirmMode && runAction(confirmId, confirmMode)}
            >
              {loadingAction ? "Working..." : confirmMode === "delete" ? "Delete" : confirmMode === "activate" ? "Activate" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Doctor Modal */}
      <AlertDialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invite Doctor</AlertDialogTitle>
            <AlertDialogDescription>Enter the doctor’s email. They will receive an invite to join your clinic.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input type="email" placeholder="doctor@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 text-white" disabled={inviteLoading} onClick={handleInvite}>
              {inviteLoading ? "Sending..." : "Send Invite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
