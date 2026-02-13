"use client";

import type React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type FilterState = {
  search: string;
  status: string;
  gender: string[];
  ageRange: [number, number];
  conditions: string[];
  doctors: string[];
};

export default function PatientsPage() {
  const { data: session } = useSession();
  const clinicId = (session as any)?.user?.clinicId ?? null;

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    gender: [],
    ageRange: [0, 100],
    conditions: [],
    doctors: [],
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  // ✅ INVITE PATIENT
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    if (!clinicId) {
      alert(
        "Clinic ID is missing on your session. Please re-login or contact admin."
      );
      return;
    }
    setInviteLoading(true);
    try {
      const res = await fetch("/api/clinic/invite/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          fullName: inviteName,
          clinicId,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        alert("Patient invite sent!");
        setInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
      } else {
        alert("Error: " + (data?.error || "Failed to invite patient"));
      }
    } catch (e) {
      console.error("invite patient error", e);
      alert("Unexpected error while sending invite.");
    } finally {
      setInviteLoading(false);
    }
  };
  // ✅ INVITE PATIENT SON

  const handleDelete = async (patientId: string) => {
    await fetch(`/api/patients/${patientId}`, { method: "DELETE" });
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setDeleteDialogOpen(null);
  };

  const uniqueConditions = Array.from(
    new Set(patients.map((p) => p.condition))
  );
  const uniqueDoctors = Array.from(new Set(patients.map((p) => p.doctor)));

  // YALNIZ /api/patients-dən oxuyuruq – ClinicPatient merge artıq backend-dədir
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        setPatients(data ?? []);
      } catch (error) {
        console.error("Failed to load patients", error);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    let result = [...patients];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((patient) =>
        (patient.name ?? "").toLowerCase().includes(searchLower) ||
        (patient.email ?? "").toLowerCase().includes(searchLower) ||
        (patient.condition ?? "").toLowerCase().includes(searchLower) ||
        (patient.doctor ?? "").toLowerCase().includes(searchLower) ||
        (patient.phone ?? "").includes(filters.search)
      );
    }

    if (filters.status !== "all") {
      result = result.filter(
        (patient) => (patient.status ?? "") === filters.status
      );
    }

    if (filters.gender.length > 0) {
      result = result.filter((patient) =>
        filters.gender.includes(patient.gender)
      );
    }

    result = result.filter(
      (patient) =>
        (patient.age ?? 0) >= filters.ageRange[0] &&
        (patient.age ?? 0) <= filters.ageRange[1]
    );

    if (filters.conditions.length > 0) {
      result = result.filter((patient) =>
        filters.conditions.includes(patient.condition)
      );
    }

    if (filters.doctors.length > 0) {
      result = result.filter((patient) =>
        filters.doctors.includes(patient.doctor)
      );
    }

    setFilteredPatients(result);

    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "all") count++;
    if (filters.gender.length > 0) count++;
    if (filters.ageRange[0] > 0 || filters.ageRange[1] < 100) count++;
    if (filters.conditions.length > 0) count++;
    if (filters.doctors.length > 0) count++;
    setActiveFilterCount(count);
  }, [filters, patients]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };
  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };
  const handleGenderChange = (gender: string) => {
    setFilters((prev) => {
      const newGenders = prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender];
      return { ...prev, gender: newGenders };
    });
  };
  const handleAgeRangeChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      ageRange: [value[0], value[1]] as [number, number],
    }));
  };
  const handleConditionChange = (condition: string) => {
    setFilters((prev) => {
      const newConditions = prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition];
      return { ...prev, conditions: newConditions };
    });
  };
  const handleDoctorChange = (doctor: string) => {
    setFilters((prev) => {
      const newDoctors = prev.doctors.includes(doctor)
        ? prev.doctors.filter((d) => d !== doctor)
        : [...prev.doctors, doctor];
      return { ...prev, doctors: newDoctors };
    });
  };
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      gender: [],
      ageRange: [0, 100],
      conditions: [],
      doctors: [],
    });
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
              Patients
            </h1>
            <p className="text-muted-foreground">
              Manage your patients and their medical records.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/patients/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Link>
            </Button>
            {/* ✅ Invite düyməsi */}
            <Button variant="outline" onClick={() => setInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Patient
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Patients List</CardTitle>
                <CardDescription>
                  A list of all patients in your clinic with their details.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search patients..."
                    className="pl-8 w-full md:w-[250px]"
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] md:w-[400px]"
                    align="end"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filters</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="h-8 px-2"
                        >
                          Reset
                          <X className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={filters.status}
                          onValueChange={handleStatusChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="male"
                              checked={filters.gender.includes("Male")}
                              onCheckedChange={() => handleGenderChange("Male")}
                            />
                            <label htmlFor="male">Male</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="female"
                              checked={filters.gender.includes("Female")}
                              onCheckedChange={() =>
                                handleGenderChange("Female")
                              }
                            />
                            <label htmlFor="female">Female</label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Age Range</Label>
                          <span className="text-sm text-muted-foreground">
                            {filters.ageRange[0]} - {filters.ageRange[1]} years
                          </span>
                        </div>
                        <Slider
                          defaultValue={[0, 100]}
                          min={0}
                          max={100}
                          step={1}
                          value={[filters.ageRange[0], filters.ageRange[1]]}
                          onValueChange={handleAgeRangeChange}
                          className="py-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Conditions</Label>
                        <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                          {uniqueConditions.map((condition) => (
                            <div
                              key={condition}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`condition-${condition}`}
                                checked={filters.conditions.includes(
                                  condition
                                )}
                                onCheckedChange={() =>
                                  handleConditionChange(condition)
                                }
                              />
                              <label
                                htmlFor={`condition-${condition}`}
                                className="text-sm"
                              >
                                {condition}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Doctors</Label>
                        <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                          {uniqueDoctors.map((doctor) => (
                            <div
                              key={doctor}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`doctor-${doctor}`}
                                checked={filters.doctors.includes(doctor)}
                                onCheckedChange={() =>
                                  handleDoctorChange(doctor)
                                }
                              />
                              <label
                                htmlFor={`doctor-${doctor}`}
                                className="text-sm"
                              >
                                {doctor}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>

            {/* Active filters display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.status !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Status: {filters.status}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleStatusChange("all")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove status filter</span>
                    </Button>
                  </Badge>
                )}

                {filters.gender.map((gender) => (
                  <Badge
                    key={gender}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {gender}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleGenderChange(gender)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">
                        Remove {gender} filter
                      </span>
                    </Button>
                  </Badge>
                ))}

                {(filters.ageRange[0] > 0 || filters.ageRange[1] < 100) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Age: {filters.ageRange[0]}-{filters.ageRange[1]}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleAgeRangeChange([0, 100])}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Reset age range</span>
                    </Button>
                  </Badge>
                )}

                {filters.conditions.map((condition) => (
                  <Badge
                    key={condition}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {condition}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleConditionChange(condition)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">
                        Remove {condition} filter
                      </span>
                    </Button>
                  </Badge>
                ))}

                {filters.doctors.map((doctor) => (
                  <Badge
                    key={doctor}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {doctor.replace("Dr. ", "")}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleDoctorChange(doctor)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">
                        Remove {doctor} filter
                      </span>
                    </Button>
                  </Badge>
                ))}

                {filters.search && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Search: {filters.search}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, search: "" }))
                      }
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Loading/empty states */}
            {patients.length === 0 &&
            filters.search === "" &&
            filters.status === "all" &&
            filters.gender.length === 0 &&
            filters.conditions.length === 0 &&
            filters.doctors.length === 0 &&
            filteredPatients.length === 0 ? (
              <div>Loading...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No patients found</h3>
                <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                  No patients match your current filters. Try adjusting your
                  search or filter criteria.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Reset all filters
                </Button>
              </div>
            ) : (
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="table-cell">
                      Age/Gender
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="table-cell">Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="whitespace-nowrap">
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <Avatar>
                            <AvatarImage
                              src={patient.image || "/user-2.png"}
                              alt={patient.name}
                            />
                            <AvatarFallback>
                              {patient?.name?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground md:hidden">
                              {(patient.age ?? "—")} •{" "}
                              {(patient.gender ?? "—")}
                            </p>
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="table-cell">
                        {(patient.age ?? "—")} • {(patient.gender ?? "—")}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            patient.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            patient.status === "Active"
                              ? "bg-green-500 text-gray-700"
                              : "bg-yellow-500 text-neutral-700"
                          }
                        >
                          {patient.status ?? "—"}
                        </Badge>
                      </TableCell>

                      <TableCell className="table-cell">
                        {patient.email ?? "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {patient.doctor || "Unassigned"}
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
                              <Link
                                href={`/dashboard/patients/${patient.id}/files`}
                              >
                                Files
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/patients/${patient.id}`}>
                                View profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/patients/${patient.id}/edit`}
                              >
                                Edit details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/patients/${patient.id}/prescriptions`}
                              >
                                Prescriptions
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteDialogOpen(patient.id)
                              }
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete dialog */}
      <AlertDialog
        open={!!deleteDialogOpen}
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to Delete this patient?
            </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The patient's data will be
            permanently removed.
          </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialogOpen!)}
              className="bg-red-500 text-neutral-50 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ INVITE PATIENT MODAL */}
      <AlertDialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invite Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Enter patient’s details. They will receive an invite to join your
              clinic.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="text"
            placeholder="Full name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="patient@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 text-white"
              disabled={inviteLoading}
              onClick={handleInvite}
            >
              {inviteLoading ? "Sending..." : "Send Invite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
