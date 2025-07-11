"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical } from "lucide-react";
import { format } from "date-fns";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch("/api/prescriptions");
        const data = await res.json();
        setPrescriptions(data);
      } catch (error) {
        console.error("Failed to fetch prescriptions", error);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Prescriptions</h2>
        <Button asChild>
          <Link href="/dashboard/prescriptions/create">Add Prescription</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.patient?.name || "-"}</TableCell>
                  <TableCell>{format(new Date(prescription.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <ul className="space-y-1">
                      {prescription.medications.map((med: any, index: number) => (
                        <li key={index}>
                          {med.name} – {med.dosage}
                          {med.toothNumber && ` (Tooth: ${med.toothNumber})`}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/prescriptions/${prescription.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}