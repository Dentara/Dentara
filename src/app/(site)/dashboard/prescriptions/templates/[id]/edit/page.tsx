"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

export default function TemplateEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/prescriptions/templates/${id}`);
        const data = await res.json();
        setTemplate(data);
      } catch (error) {
        console.error("Failed to fetch template", error);
      }
    };
    if (id) fetchTemplate();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/prescriptions/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!res.ok) throw new Error("Update failed");
      router.push(`/dashboard/prescriptions/templates/${id}`);
    } catch (error) {
      console.error("Failed to update template", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMedication = (index: number) => {
    const updated = [...template.medications];
    updated.splice(index, 1);
    setTemplate({ ...template, medications: updated });
  };

  if (!template) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input
              value={template.name || ""}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="e.g. Tooth Extraction Kit"
            />
          </div>

          <div className="space-y-2">
            <Label>Medications</Label>
            {template.medications.map((med: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-md mb-2">
          <Input
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => {
                    const updated = [...template.medications];
                    updated[index].dosage = e.target.value;
                    setTemplate({ ...template, medications: updated });
                  }}
                />
                <Input
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) => {
                    const updated = [...template.medications];
                    updated[index].frequency = e.target.value;
                    setTemplate({ ...template, medications: updated });
                  }}
                />
                <Input
                  placeholder="Duration"
                  value={med.duration}
                  onChange={(e) => {
                    const updated = [...template.medications];
                    updated[index].duration = e.target.value;
                    setTemplate({ ...template, medications: updated });
                  }}
                />
                <Input
                  placeholder="Tooth Number"
                  value={med.toothNumber}
                  onChange={(e) => {
                    const updated = [...template.medications];
                    updated[index].toothNumber = e.target.value;
                    setTemplate({ ...template, medications: updated });
                  }}
                />
                <Textarea
                  placeholder="Notes"
                  value={med.notes}
                  onChange={(e) => {
                    const updated = [...template.medications];
                    updated[index].notes = e.target.value;
                    setTemplate({ ...template, medications: updated });
                  }}
                />
                <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveMedication(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
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
