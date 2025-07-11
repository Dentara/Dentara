"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

const prescriptions = [
  {
    id: "1",
    patient: { name: "John Smith", id: "PT1001" },
    date: "2023-07-15",
    medications: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "3x/day", duration: "7 days", notes: "After meals" },
    ],
    diagnosis: "Tooth infection",
    notes: "Follow-up in 5 days"
  }
];

export default function RenewPrescriptionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const prescriptionData = prescriptions.find((p) => p.id === id);

  const [notes, setNotes] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    toast({ title: "Prescription renewed", description: "Successfully renewed." });
    router.push(`/dashboard/prescriptions/${id}`);
  };

  if (!prescriptionData) return <div>Not found</div>;

  return (
    <div className="container py-8 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Renew Prescription</CardTitle>
            <CardDescription>Patient: {prescriptionData.patient.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Diagnosis</h4>
              <p className="text-sm text-muted-foreground">{prescriptionData.diagnosis}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold">Medications</h4>
              <ul className="list-disc ml-6 text-sm text-muted-foreground space-y-1">
                {prescriptionData.medications.map((med, i) => (
                  <li key={i}>{med.name} – {med.dosage}, {med.frequency}, {med.duration} {med.notes && `– ${med.notes}`}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Renewal Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any relevant notes..." />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Renew</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}