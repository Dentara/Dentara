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
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, MoreHorizontal, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const experienceRanges = ["0-5 years", "5-10 years", "10-15 years", "15+ years"];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Error loading doctors:", err);
      }
    };

    fetchDoctors();
  }, []);

  // Düzəliş: field adları dəyişdi
  const specialties = useMemo(() => [...new Set(doctors.map((d) => d.specialization))], [doctors]);
  const statuses = useMemo(() => [...new Set(doctors.map((d) => d.status))], [doctors]);

  // Filter
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = searchQuery === "" || doctor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) || doctor.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.includes(doctor.specialization);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(doctor.status);
    const matchesExperience =
      selectedExperience.length === 0 ||
      (selectedExperience.includes("0-5 years") && Number.parseInt(doctor.experience) < 5) ||
      (selectedExperience.includes("5-10 years") && Number.parseInt(doctor.experience) >= 5 && Number.parseInt(doctor.experience) < 10) ||
      (selectedExperience.includes("10-15 years") && Number.parseInt(doctor.experience) >= 10 && Number.parseInt(doctor.experience) < 15) ||
      (selectedExperience.includes("15+ years") && Number.parseInt(doctor.experience) >= 15);
    return matchesSearch && matchesSpecialty && matchesStatus && matchesExperience;
  });

  // Toggle filters (düzəliş olunmayıb)
  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) => (prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]));
  };
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };
  const toggleExperience = (experience: string) => {
    setSelectedExperience((prev) => (prev.includes(experience) ? prev.filter((e) => e !== experience) : [...prev, experience]));
  };
  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedStatuses([]);
    setSelectedExperience([]);
    setActiveFilters(0);
  };
  const applyFilters = () => {
    const totalActiveFilters = selectedSpecialties.length + selectedStatuses.length + selectedExperience.length;
    setActiveFilters(totalActiveFilters);
    setIsFilterOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Doctors</h2>
            <p className="text-muted-foreground">Manage your medical staff and their information.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/doctors/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Link>
          </Button>
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
                <Input type="search" placeholder="Search doctors..." className="pl-8 w-full md:w-[250px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className={activeFilters > 0 ? "relative bg-primary/10" : ""}>
                    <Filter className="h-4 w-4" />
                    {activeFilters > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">{activeFilters}</span>}
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
                            <Checkbox id={`specialty-${specialty}`} checked={selectedSpecialties.includes(specialty)} onCheckedChange={() => toggleSpecialty(specialty)} />
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
                            <Checkbox id={`status-${status}`} checked={selectedStatuses.includes(status)} onCheckedChange={() => toggleStatus(status)} />
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
                            <Checkbox id={`experience-${range}`} checked={selectedExperience.includes(range)} onCheckedChange={() => toggleExperience(range)} />
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
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        toggleSpecialty(specialty);
                        setActiveFilters((prev) => prev - 1);
                      }}
                    />
                  </Badge>
                ))}
                {selectedStatuses.map((status) => (
                  <Badge key={`badge-status-${status}`} variant="outline" className="flex items-center gap-1">
                    {status}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        toggleStatus(status);
                        setActiveFilters((prev) => prev - 1);
                      }}
                    />
                  </Badge>
                ))}
                {selectedExperience.map((exp) => (
                  <Badge key={`badge-exp-${exp}`} variant="outline" className="flex items-center gap-1">
                    {exp}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        toggleExperience(exp);
                        setActiveFilters((prev) => prev - 1);
                      }}
                    />
                  </Badge>
                ))}
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                    Clear all
                  </Button>
                )}
              </div>
            )}
            <Table className="whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="table-cell">Patients</TableHead>
                  <TableHead className="table-cell">Experience</TableHead>
                  <TableHead className="table-cell">Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="whitespace-nowrap">
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No doctors found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={doctor.profilePhoto || "/user-2.png"} alt={doctor.fullName || "Doctor"} />
                            <AvatarFallback>{doctor.fullName?.charAt(0) ?? "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doctor.fullName}</p>
                            <p className="text-sm text-muted-foreground md:hidden">{doctor.specialization}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="table-cell">{doctor.specialization}</TableCell>
                      <TableCell>
                        <Badge variant={doctor.status === "Active" ? "default" : doctor.status === "On Leave" ? "outline" : "secondary"} className={doctor.status === "Active" ? "bg-green-500 text-neutral-700" : doctor.status === "On Leave" ? "bg-amber-500 text-neutral-700" : "bg-red-500 text-neutral-50"}>
                          {doctor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="table-cell">{doctor.patients ?? 0}</TableCell>
                      <TableCell className="table-cell">{doctor.experience}</TableCell>
                      <TableCell className="table-cell">
                        <div className="text-sm">
                          <p className="mb-1">{doctor.email}</p>
                          <p className="text-muted-foreground">{doctor.phone}</p>
                        </div>
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
                            <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to Deactivate this doctor?</AlertDialogTitle>
            <AlertDialogDescription>This action will remove the doctor from active status and they will no longer be visible to patients. You can reactivate them later if needed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteDialogOpen(false)} className="bg-red-500 text-neutral-50 hover:bg-red-700">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
