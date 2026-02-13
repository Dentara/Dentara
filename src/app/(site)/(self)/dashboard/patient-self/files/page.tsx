// app/(site)/dashboard/patient-self/files/page.tsx
import React from "react";
import PatientSelfFilesClient from "./patient-self-files.client";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Files</h1>
        <p className="text-sm text-muted-foreground">
          View your X-Rays, face/teeth photos and documents grouped by albums and dates.
        </p>
      </div>
      <PatientSelfFilesClient />
    </div>
  );
}
