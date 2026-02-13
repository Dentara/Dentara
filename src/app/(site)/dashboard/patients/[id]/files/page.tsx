// app/(site)/dashboard/patients/[id]/files/page.tsx
import React from "react";
import PatientFilesClient from "./patient-files.client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id: patientId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient Files</h1>
        <p className="text-sm text-muted-foreground">
          Access patient files (requires patient consent by scope).
        </p>
      </div>

      <PatientFilesClient
        patientId={patientId}
        uploadsEnabled
      />
    </div>
  );
}
