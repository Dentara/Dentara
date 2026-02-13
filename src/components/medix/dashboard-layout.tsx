"use client";

import type React from "react";
import { MainNav } from "@/components/medix/main-nav";
import { Sidebar } from "@/components/medix/sidebar";
import { UserNav } from "@/components/medix/user-nav";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Desktopda açıq, mobildə bağlı başla
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <MainNav onMenuClick={() => setIsSidebarOpen((v) => !v)} />
          <UserNav />
        </div>
      </header>

      {/* Body */}
      <div className="relative">
        {/* Sidebar: <xl fixed/slide-in, >=xl statik */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Məzmun: desktopda sidebar eni qədər padding veririk */}
        <main className="px-4 py-4 md:px-6 xl:pl-64">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
export { DashboardLayout };
