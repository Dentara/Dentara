// app/(site)/dashboard/patient-self/layout.tsx
import PatientSidebar from "@/components/sidebar/PatientSidebar";
import { ReactNode } from "react";

/**
 * Yalnız patient self-portal üçün layout.
 * Clinic dashboardun layoutuna toxunmur.
 */
export default function PatientSelfLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <PatientSidebar />
      <main className="flex-1 p-6 bg-neutral-50 dark:bg-neutral-950">
        {children}
      </main>
    </div>
  );
}
