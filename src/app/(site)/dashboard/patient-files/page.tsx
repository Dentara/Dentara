// app/(site)/dashboard/patient-files/page.tsx
import React from "react";
import SearchPatientsClient from "./SearchPatientsClient";

export const dynamic = "force-dynamic";

export default async function PatientFilesIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient Files</h1>
        <p className="text-sm text-muted-foreground">
          Find a patient and open their files library.
        </p>
      </div>

      {/* Client-side search (no Prisma import needed) */}
      <SearchPatientsClient />
    </div>
  );
}
