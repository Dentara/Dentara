"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function PrescriptionViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [prescription, setPrescription] = useState<any | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await fetch(`/api/prescriptions/${id}`);
        const data = await res.json();
        setPrescription(data);
      } catch (error) {
        console.error("Failed to fetch prescription", error);
      }
    };
    if (id) fetchPrescription();
  }, [id]);

  if (!prescription) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prescription Details</h2>
          <p className="text-muted-foreground">Patient: {prescription.patient?.name || "Unknown"}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/prescriptions">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Date: {format(new Date(prescription.date), "dd MMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-md font-semibold">Diagnosis</h4>
            <p className="text-sm text-muted-foreground">
              {prescription.diagnosis || "Not provided"}
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold">Notes</h4>
            <p className="text-sm text-muted-foreground">
              {prescription.notes || "No additional notes."}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="text-md font-semibold">Medications</h4>
            <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
              {prescription.medications.map((med: any, idx: number) => (
                <li key={idx}>
                  {med.name} – {med.dosage} {med.toothNumber ? `(Tooth: ${med.toothNumber})` : ""}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
