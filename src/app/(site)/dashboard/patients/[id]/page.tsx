"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, Download, Edit, FileText, MoreHorizontal, Pill, Plus, Printer, Receipt, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { use, useEffect } from "react";

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params);

  const [activeTab, setActiveTab] = useState("overview");

  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [pRes, aRes, prRes, lRes, bRes] = await Promise.all([
          fetch(`/api/patient/${patientId}`),
          fetch(`/api/patient/${patientId}/appointments`),
          fetch(`/api/patient/${patientId}/prescriptions`),
          fetch(`/api/patient/${patientId}/lab-results`),
          fetch(`/api/patient/${patientId}/billing`),
        ]);

        const [p, a, pr, l, b] = await Promise.all([
          pRes.json(), aRes.json(), prRes.json(), lRes.json(), bRes.json()
        ]);

        setPatient(p);
        setAppointments(a);
        setPrescriptions(pr);
        setLabResults(l);
        setBillingHistory(b);
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
      }
    }

    fetchAllData();
  }, [patientId]);

    if (!patient) {
    return <div className="p-10">Loading patient data...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Patient Details</h1>
          <p className="text-muted-foreground">View and manage patient information.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Patient Profile Card */}
        <Card className="lg:w-1/3">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>Patient Profile</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Patient
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Deactivate Patient</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>Patient ID: {patient.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={patient.image || "/user-2.png"} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-muted-foreground">
                {patient.age} years • {patient.gender}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-500">Active</Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  {patient.bloodType}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="font-medium mb-3">Personal Information</h3>
                  <p className="text-sm">Date of Birth: {patient.dob}</p>
                  <p className="text-sm">Phone: {patient.phone}</p>
                  <p className="text-sm">Email: {patient.email}</p>
                  <p className="text-sm">Address: {patient.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium mb-3">Medical Information</h3>
                  <div className="text-sm space-y-1.5">
                    <p>Blood Type: {patient.bloodType}</p>
                    <p>Allergies: {patient.allergies.join(", ")}</p>
                    <p>Conditions: {patient.conditions.join(", ")}</p>
                    <p>Primary Doctor: {patient.primaryDoctor}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Receipt className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="font-medium mb-3">Insurance Information</h3>
                  <p className="text-sm">Provider: {patient.insuranceProvider}</p>
                  <p className="text-sm">Policy Number: {patient.policyNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="shrink-0 h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="font-medium mb-3">Emergency Contact</h3>
                  <p className="text-sm">Name: {patient.emergencyContact.name}</p>
                  <p className="text-sm">Relationship: {patient.emergencyContact.relationship}</p>
                  <p className="text-sm">Phone: {patient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Registered on: {patient.registrationDate}</span>
              <span>Last Updated: 2024-03-15</span>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Tabs */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Summary</CardTitle>
                  <CardDescription>Overview of patient's health status and recent activities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Next Appointment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Pill className="mr-2 h-4 w-4" />
                          Active Medications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        
                        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setActiveTab("prescriptions")}>
                          View all medications
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Recent Lab Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        
                        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setActiveTab("lab-results")}>
                          View results
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Appointments</h3>
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-md flex-wrap gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`h-2 w-2 mt-2 rounded-full ${appointment.status === "Scheduled" ? "bg-blue-500" : appointment.status === "Completed" ? "bg-green-500" : "bg-amber-500"}`} />
                            <div>
                              <p className="font-medium">{appointment.type}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                {appointment.date}
                                <Clock className="ml-2 mr-1 h-3 w-3" />
                                {appointment.time}
                              </div>
                              <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                            </div>
                          </div>
                          <Badge variant={appointment.status === "Scheduled" ? "outline" : "default"} className={appointment.status === "Scheduled" ? "border-blue-500 text-blue-500" : appointment.status === "Completed" ? "bg-green-500" : "bg-amber-500"}>
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("appointments")}>
                      View All Appointments
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Vital Signs Trend</h3>
                      <Button variant="outline" size="sm">
                        View History
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Blood Pressure</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">135/85</p>
                          <p className="text-sm text-muted-foreground">Last checked: Apr 5, 2024</p>
                          <div className="mt-2 h-1 w-full bg-muted">
                            <div className="h-1 bg-amber-500" style={{ width: "70%" }} />
                          </div>
                          <p className="text-xs text-amber-500 mt-1">Slightly elevated</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Blood Glucose</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">125 mg/dL</p>
                          <p className="text-sm text-muted-foreground">Last checked: Apr 5, 2024</p>
                          <div className="mt-2 h-1 w-full bg-muted">
                            <div className="h-1 bg-amber-500" style={{ width: "65%" }} />
                          </div>
                          <p className="text-xs text-amber-500 mt-1">Above normal</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Weight</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">82 kg</p>
                          <p className="text-sm text-muted-foreground">Last checked: Apr 5, 2024</p>
                          <div className="mt-2 h-1 w-full bg-muted">
                            <div className="h-1 bg-green-500" style={{ width: "50%" }} />
                          </div>
                          <p className="text-xs text-green-500 mt-1">Stable</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Appointment History</CardTitle>
                    <CardDescription>View all appointments and medical visits.</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="table-cell">Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        <TableHead>Tooth</TableHead>
                        <TableHead>Procedure</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="whitespace-nowrap">
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div>
                              <p>{appointment.date}</p>
                              <p className="text-sm text-muted-foreground">{appointment.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.type}</TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>{appointment.toothNumber || "-"}</TableCell>
                          <TableCell>{appointment.procedureType || "-"}</TableCell>
                          <TableCell>{appointment.price ? `₼${appointment.price}` : "-"}</TableCell>
                          <TableCell>
                            <Badge variant={appointment.status === "Scheduled" ? "outline" : "default"} className={appointment.status === "Scheduled" ? "border-blue-500 text-blue-500" : appointment.status === "Completed" ? "bg-green-500" : "bg-amber-500"}>
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="table-cell max-w-[200px] truncate">{appointment.notes || "No notes available"}</TableCell>
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
                                <DropdownMenuItem>View details</DropdownMenuItem>
                                {appointment.status === "Scheduled" && (
                                  <>
                                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Cancel appointment</DropdownMenuItem>
                                  </>
                                )}
                                {appointment.status === "Completed" && (
                                  <>
                                    <DropdownMenuItem>View medical notes</DropdownMenuItem>
                                    <DropdownMenuItem>Download summary</DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Prescriptions</CardTitle>
                    <CardDescription>View all medications and prescriptions.</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Prescription
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage & Frequency</TableHead>
                        <TableHead>Date Range</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="whitespace-nowrap">
                      {prescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.medication}</TableCell>
                          <TableCell>
                            {prescription.dosage}, {prescription.frequency}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{prescription.startDate}</p>
                              <p className="text-sm text-muted-foreground">to {prescription.endDate === "Indefinite" ? "Indefinite" : prescription.endDate}</p>
                            </div>
                          </TableCell>
                          <TableCell>{prescription.doctor}</TableCell>
                          <TableCell>
                            <Badge variant={prescription.status === "Active" ? "default" : "secondary"} className={prescription.status === "Active" ? "bg-green-500" : "bg-gray-500"}>
                              {prescription.status}
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View details</DropdownMenuItem>
                                <DropdownMenuItem>Print prescription</DropdownMenuItem>
                                {prescription.status === "Active" && (
                                  <>
                                    <DropdownMenuItem>Refill prescription</DropdownMenuItem>
                                    <DropdownMenuItem>Adjust dosage</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Discontinue</DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lab-results" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Lab Results</CardTitle>
                    <CardDescription>View all laboratory test results.</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Order New Test
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {labResults.map((labResult) => (
                    <Card key={labResult.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start flex-wrap gap-3">
                          <div>
                            <CardTitle>{labResult.type}</CardTitle>
                            <CardDescription>
                              Date: {labResult.date} • Ordered by: {labResult.orderedBy}
                            </CardDescription>
                          </div>
                          <Badge variant={labResult.status === "Completed" ? "default" : "outline"} className={labResult.status === "Completed" ? "bg-green-500" : "border-blue-500 text-blue-500"}>
                            {labResult.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table className="whitespace-nowrap">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Test</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>Reference Range</TableHead>
                              <TableHead>Flag</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody className="whitespace-nowrap">
                            {labResult.results.map((result, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{result.name}</TableCell>
                                <TableCell>{result.value}</TableCell>
                                <TableCell>{result.range}</TableCell>
                                <TableCell>
                                  <Badge variant={result.flag === "Normal" ? "outline" : "default"} className={result.flag === "Normal" ? "border-green-500 text-green-500" : result.flag === "High" ? "bg-amber-500" : "bg-red-500"}>
                                    {result.flag}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="flex justify-end mt-4 gap-2">
                          <Button variant="outline" size="sm">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View all billing and payment information.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export History
                    </Button>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Invoice
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Insurance</TableHead>
                        <TableHead className="text-right">Patient Responsibility</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="whitespace-nowrap">
                      {billingHistory.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{bill.date}</TableCell>
                          <TableCell>{bill.description}</TableCell>
                          <TableCell className="text-right">${bill.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${bill.insurance.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${bill.patientResponsibility.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={bill.status === "Paid" ? "default" : "outline"} className={bill.status === "Paid" ? "bg-green-500" : bill.status === "Pending" ? "border-amber-500 text-amber-500" : "border-red-500 text-red-500"}>
                              {bill.status}
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View invoice</DropdownMenuItem>
                                <DropdownMenuItem>Print invoice</DropdownMenuItem>
                                {bill.status !== "Paid" && <DropdownMenuItem>Process payment</DropdownMenuItem>}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Overview of patient's payment history.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Total Billed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">$1,130.00</p>
                        <p className="text-sm text-muted-foreground">Year to date</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Insurance Covered</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">$904.00</p>
                        <p className="text-sm text-muted-foreground">80% coverage</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Patient Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">$152.00</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-red-500">$74.00 outstanding</span>
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
