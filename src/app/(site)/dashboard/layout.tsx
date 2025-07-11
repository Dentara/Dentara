import SidebarWrapper from "@/components/SidebarWrapper";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="w-64 shrink-0">
        <SidebarWrapper />
      </div>
      <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
        {children}
      </main>
    </div>
  );
}
