"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export default function PrescriptionTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    medications: [
      { name: "", dosage: "", frequency: "", duration: "", toothNumber: "", notes: "" },
    ],
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/prescriptions/templates");
        const data = await res.json();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to fetch templates", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleAddMedication = () => {
    setNewTemplate({
      ...newTemplate,
      medications: [
        ...newTemplate.medications,
        { name: "", dosage: "", frequency: "", duration: "", toothNumber: "", notes: "" },
      ],
    });
  };

  const handleRemoveMedication = (index: number) => {
    const meds = [...newTemplate.medications];
    meds.splice(index, 1);
    setNewTemplate({ ...newTemplate, medications: meds });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/prescriptions/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });
      if (!res.ok) throw new Error("Failed to create template");
      const saved = await res.json();
      setTemplates([...templates, saved]);
      setNewTemplate({ name: "", medications: [{ name: "", dosage: "", frequency: "", duration: "", toothNumber: "", notes: "" }] });
    } catch (error) {
      console.error("Failed to create template", error);
    }
  };
  return (
    <div className="container py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Dental Template</CardTitle>
          <CardDescription>Prepare commonly used dental prescriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="e.g. Root Canal Protocol"
            />
          </div>

          <div className="space-y-2">
            <Label>Medications</Label>
            {newTemplate.medications.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-md mb-2">
                <Input
                  placeholder="Name"
                  value={med.name}
                  onChange={(e) => {
                    const updated = [...newTemplate.medications];
                    updated[index].name = e.target.value;
                    setNewTemplate({ ...newTemplate, medications: updated });
                  }}
                />
                <Input
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => {
                    const updated = [...newTemplate.medications];
                    updated[index].dosage = e.target.value;
                    setNewTemplate({ ...newTemplate, medications: updated });
                  }}
                />
                <Input
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) => {
                    const updated = [...newTemplate.medications];
                    updated[index].frequency = e.target.value;
                    setNewTemplate({ ...newTemplate, medications: updated });
                  }}
                />
                <Input
                  placeholder="Duration"
                  value={med.duration}
                  onChange={(e) => {
                    const updated = [...newTemplate.medications];
                    updated[index].duration = e.target.value;
                    setNewTemplate({ ...newTemplate, medications: updated });
                  }}
                />
                <Input
                  placeholder="Tooth Number"
                  value={med.toothNumber}
                  onChange={(e) => {
                    const updated = [...newTemplate.medications];
                    updated[index].toothNumber = e.target.value;
                    setNewTemplate({ ...newTemplate, medications: updated });
                  }}
                />
                <Textarea
                  placeholder="Notes"
                  value={med.notes}
                  onChange={(e) => {
                    const updated = [...newTemplate.medications];
                    updated[index].notes = e.target.value;
                    setNewTemplate({ ...newTemplate, medications: updated });
                  }}
                />
                <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveMedication(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddMedication}>
              <Plus className="mr-2 h-4 w-4" /> Add Medication
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit}>Save Template</Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6">
        {templates.map((template, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground list-disc ml-6 text-sm">
                {template.medications.map((med: any, i: number) => (
                  <li key={i}>
                    {med.name} – {med.dosage} {med.toothNumber && `(Tooth: ${med.toothNumber})`}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
