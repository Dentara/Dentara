
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function EditPrescriptionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [prescription, setPrescription] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescription),
      });
      if (!res.ok) throw new Error("Update failed");
      toast({ title: "Updated", description: "Prescription updated successfully" });
      router.push(`/dashboard/prescriptions/${id}`);
    } catch (error) {
      toast({ title: "Error", description: "Update failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!prescription) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Prescription</CardTitle>
          <p className="text-muted-foreground text-sm">Patient: {prescription.patient?.name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              value={prescription.date || ""}
              onChange={(e) => setPrescription({ ...prescription, date: e.target.value })}
              type="date"
            />
          </div>

          <div className="space-y-2">
            <Label>Diagnosis</Label>
            <Input
              value={prescription.diagnosis || ""}
              onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={prescription.notes || ""}
              onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Medications</Label>
            {prescription.medications.map((med: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-md mb-2">
                <Input
                  placeholder="Name"
                  value={med.name || ""}
                  onChange={(e) => {
                    const newMeds = [...prescription.medications];
                    newMeds[index].name = e.target.value;
                    setPrescription({ ...prescription, medications: newMeds });
                  }}
                />
                <Input
                  placeholder="Dosage"
                  value={med.dosage || ""}
                  onChange={(e) => {
                    const newMeds = [...prescription.medications];
                    newMeds[index].dosage = e.target.value;
                    setPrescription({ ...prescription, medications: newMeds });
                  }}
                />
                <Input
                  placeholder="Frequency"
                  value={med.frequency || ""}
                  onChange={(e) => {
                    const newMeds = [...prescription.medications];
                    newMeds[index].frequency = e.target.value;
                    setPrescription({ ...prescription, medications: newMeds });
                  }}
                />
                <Input
                  placeholder="Duration"
                  value={med.duration || ""}
                  onChange={(e) => {
                    const newMeds = [...prescription.medications];
                    newMeds[index].duration = e.target.value;
                    setPrescription({ ...prescription, medications: newMeds });
                  }}
                />
                <Input
                  placeholder="Tooth Number"
                  value={med.toothNumber || ""}
                  onChange={(e) => {
                    const newMeds = [...prescription.medications];
                    newMeds[index].toothNumber = e.target.value;
                    setPrescription({ ...prescription, medications: newMeds });
                  }}
                />
                <Textarea
                  placeholder="Notes"
                  value={med.notes || ""}
                  onChange={(e) => {
                    const newMeds = [...prescription.medications];
                    newMeds[index].notes = e.target.value;
                    setPrescription({ ...prescription, medications: newMeds });
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
