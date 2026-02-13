"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Plus,
  Printer,
  Search,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

type Params = { id: string };

type Prescription = {
  id: string;
  date?: string;
  medication?: string;
  dosage?: string;
  frequency?: string;
  doctor?: string;
  status?: "Active" | "Completed" | string;
  refills?: number;
};

export default function Page({ params }: { params: Promise<Params> }) {
  const { id: patientId } = use(params);

  const [patient, setPatient] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("failed to fetch patient");
        const data = await res.json();
        if (ignore) return;
        setPatient(data);
        setPrescriptions((data?.prescriptions ?? []) as Prescription[]);
      } catch (e) {
        console.error("prescriptions fetch error", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [patientId]);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return prescriptions.filter((p) => {
      const matchQ =
        !qLower ||
        [p.medication, p.dosage, p.frequency, p.doctor]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(qLower));
      const matchStatus =
        status === "all" ||
        (status === "active" && (p.status ?? "").toLowerCase() === "active") ||
        (status === "completed" && (p.status ?? "").toLowerCase() === "completed");
      return matchQ && matchStatus;
    });
  }, [prescriptions, q, status]);

  const summary = useMemo(() => {
    const active = prescriptions.filter((p) => (p.status ?? "").toLowerCase() === "active").length;
    const completed = prescriptions.filter((p) => (p.status ?? "").toLowerCase() === "completed").length;
    const refills = prescriptions.reduce((acc, p) => acc + (Number(p.refills) || 0), 0);
    return { active, completed, refills };
  }, [prescriptions]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
          Prescriptions
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: patient info + summary */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={patient?.image || "/user.png"} alt="Patient" />
                <AvatarFallback>
                  {(patient?.name?.[0] || "P").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{patient?.name ?? "—"}</h3>
                <p className="text-sm text-muted-foreground">
                  {patient?.gender ? patient.gender : "—"}
                </p>
                <div className="flex justify-center mt-2">
                  <Badge className="bg-green-500">
                    {(patient?.status ?? "Active").toString()}
                  </Badge>
                </div>
              </div>

              <div className="w-full space-y-2 pt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient ID:</span>
                  <span className="truncate max-w-[140px]">{patientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allergies:</span>
                  <span className="text-right truncate max-w-[140px]">
                    {Array.isArray(patient?.allergies) && patient.allergies.length
                      ? patient.allergies.join(", ")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Doctor:</span>
                  <span className="truncate max-w-[140px]">
                    {patient?.doctor ?? "—"}
                  </span>
                </div>
              </div>

              <div className="w-full pt-2 flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/patients/${patientId}`}>View Profile</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/patients/${patientId}/edit`}>Edit Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Prescription Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Active Prescriptions</span>
                  <span className="text-2xl font-bold">{summary.active}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-2xl font-bold">{summary.completed}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Refills Available</span>
                  <span className="text-2xl font-bold">{summary.refills}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: list */}
        <div className="w-full md:w-3/4">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Prescriptions List</CardTitle>
                <CardDescription>Manage patient's medication prescriptions</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search prescriptions..."
                    className="pl-8 w-full md:w-[250px]"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Prescription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead className="hidden md:table-cell">Dosage</TableHead>
                    <TableHead className="hidden md:table-cell">Frequency</TableHead>
                    <TableHead className="hidden md:table-cell">Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Refills</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="whitespace-nowrap">
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No prescriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.date ?? "—"}</TableCell>
                        <TableCell className="font-medium">{p.medication ?? "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.dosage ?? "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.frequency ?? "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.doctor ?? "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              (p.status ?? "").toLowerCase() === "active"
                                ? "border-green-500 text-green-500"
                                : "border-blue-500 text-blue-500"
                            }
                          >
                            {p.status ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {p.refills ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Prescription
                              </DropdownMenuItem>
                              <DropdownMenuItem>Request Refill</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Prescription</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Discontinue
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

          <div className="flex justify-between items-center mt-6">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Prescription History
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Medication Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
