// app/(site)/dashboard/doctor-self/treatments/page.tsx
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClinicTreatmentFiltersClient from "@/components/treatment/ClinicTreatmentFiltersClient";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DoctorSelfAddTreatmentPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Doctor self: doctorId sabitdir (picker gizlədiləcək).
  const doctorId = (session.user as any)?.doctorId || session.user.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Treatment (Doctor)</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading…</div>}>
            <ClinicTreatmentFiltersClient
              mode="add"
              fixedDoctorId={doctorId}
              // doctor panelində yalnız patient seçimi + Add görünür
              // Uğurdan sonra redirect komponentdə artıq qurulub:
              // → /dashboard/doctor-self/patient-treatments/[patientId]
              successRedirectBase="/dashboard/doctor-self/patient-treatments"
              contextRole="doctor"
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
