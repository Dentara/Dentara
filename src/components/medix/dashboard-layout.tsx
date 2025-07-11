"use client";
import type React from "react";
import { MainNav } from "@/components/medix/main-nav";
import { Sidebar } from "@/components/medix/sidebar";
import { UserNav } from "@/components/medix/user-nav";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect, useState, useRef } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1200 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#131212]">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <MainNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex flex-1 items-start">
        <div ref={sidebarRef}>
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>
        <main className="flex-1 xl:ml-64 overflow-auto p-4 xl:p-6">{children}</main>
      </div>
    </div>
  );
}
