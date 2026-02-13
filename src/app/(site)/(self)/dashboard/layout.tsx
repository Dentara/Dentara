// app/(site)/(self)/dashboard/layout.tsx
import { ReactNode } from "react";

/**
 * Self-portal üçün qrup layoutu.
 * Burada clinic sidebar YOXDUR; yalnız children render olunur.
 * (doctor-self və patient-self bu layoutu irs alır,
 *  clinic dashboardun /dashboard layoutunu isə almır.)
 */
export default function SelfDashboardGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
