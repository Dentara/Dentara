"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "", duration: "", toothNumber: "", notes: "" },
  ]);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "", duration: "", toothNumber: "", notes: "" },
    ]);
  };

  const handleSubmit = async () => {
    const payload = {
      patientId,
      date,
      diagnosis,
      notes,
      medications,
    };

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create prescription");

      toast({ title: "Success", description: "Prescription created." });
      router.push("/dashboard/prescriptions");
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong." });
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Prescription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Patient ID</Label>
            <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Enter patient ID" />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Diagnosis</Label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Medications</Label>
            {medications.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-md mb-2">
                <Input
                  placeholder="Name"
                  value={med.name}
                  onChange={(e) => {
                    const newMeds = [...medications];
                    newMeds[index].name = e.target.value;
                    setMedications(newMeds);
                  }}
                />
                <Input
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => {
                    const newMeds = [...medications];
                    newMeds[index].dosage = e.target.value;
                    setMedications(newMeds);
                  }}
                />
                <Input
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) => {
                    const newMeds = [...medications];
                    newMeds[index].frequency = e.target.value;
                    setMedications(newMeds);
                  }}
                />
                <Input
                  placeholder="Duration"
                  value={med.duration}
                  onChange={(e) => {
                    const newMeds = [...medications];
                    newMeds[index].duration = e.target.value;
                    setMedications(newMeds);
                  }}
                />
                <Input
                  placeholder="Tooth Number"
                  value={med.toothNumber}
                  onChange={(e) => {
                    const newMeds = [...medications];
                    newMeds[index].toothNumber = e.target.value;
                    setMedications(newMeds);
                  }}
                />
                <Textarea
                  placeholder="Notes"
                  value={med.notes}
                  onChange={(e) => {
                    const newMeds = [...medications];
                    newMeds[index].notes = e.target.value;
                    setMedications(newMeds);
                  }}
                />
              </div>
            ))}
            <Button type="button" onClick={handleAddMedication} variant="outline">
              Add Medication
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit}>Create Prescription</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
