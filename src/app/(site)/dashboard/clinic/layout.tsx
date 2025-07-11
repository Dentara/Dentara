// src/app/dashboard/clinic/layout.tsx

import "@/globals.css";
import { DashboardLayout } from "@/components/medix/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
