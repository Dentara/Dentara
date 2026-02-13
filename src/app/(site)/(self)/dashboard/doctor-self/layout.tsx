// app/(site)/dashboard/doctor-self/layout.tsx
import DoctorSidebar from "@/components/sidebar/DoctorSidebar";
import { ReactNode } from "react";

/**
 * Yalnız doctor self-portal üçün layout.
 * Clinic dashboardun layoutuna toxunmur.
 */
export default function DoctorSelfLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <DoctorSidebar />
      <main className="flex-1 p-6 bg-neutral-50 dark:bg-neutral-950">
        {children}
      </main>
    </div>
  );
}
