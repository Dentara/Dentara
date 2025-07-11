"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DentalProceduresPage() {
  const [procedures, setProcedures] = useState<any[]>([]);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const res = await fetch("/api/patients/123/dental-procedures");
        const data = await res.json();
        setProcedures(data);
      } catch (error) {
        console.error("Failed to load procedures", error);
      }
    };
    fetchProcedures();
  }, []);

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Dental Procedures</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tooth</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedures.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.tooth}</TableCell>
                  <TableCell>{item.procedure}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.doctor}</TableCell>
                  <TableCell>{item.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
