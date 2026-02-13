// app/(site)/dashboard/clinic/treatments/page.tsx
import React from "react";
import { Metadata } from "next";
import ClinicTreatmentFiltersClient from "@/components/treatment/ClinicTreatmentFiltersClient";

export const metadata: Metadata = {
  title: "Clinic — Add Treatment",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialPatientId = typeof sp?.patientId === "string" ? sp.patientId : "";
  const initialDoctorId  = typeof sp?.doctorId  === "string" ? sp.doctorId  : "";

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Clinic — Add Treatment</h1>

      {/* Add-only: yalnız pasiyent/həkim seçimi və Add düyməsi */}
      <div className="rounded-lg border p-4">
        <ClinicTreatmentFiltersClient
          mode="add"
          initialPatientId={initialPatientId}
          initialDoctorId={initialDoctorId}
        />
      </div>
    </div>
  );
}
