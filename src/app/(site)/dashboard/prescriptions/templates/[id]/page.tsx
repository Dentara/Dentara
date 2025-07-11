"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TemplateViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<any | null>(null);

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

  if (!template) return <div>Loading...</div>;

  return (
    <div className="container py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>Dental prescription template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Medications</h4>
            <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
              {template.medications.map((med: any, index: number) => (
                <li key={index}>
                  {med.name} – {med.dosage} {med.toothNumber && `(Tooth: ${med.toothNumber})`}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push("/dashboard/prescriptions/templates")}>Back</Button>
      </div>
    </div>
  );
}
