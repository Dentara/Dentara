"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

export function MainNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="flex items-center gap-3 md:gap-6">
      {/* Hamburger: yalnız <xl görünüşündə */}
      <button
        type="button"
        onClick={onMenuClick}
        className="xl:hidden p-2 rounded hover:bg-muted"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Brend – test şəkilsiz, sadə link */}
      <Link href="/dashboard/clinic" className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight">Tagiza</span>
      </Link>
    </div>
  );
}
