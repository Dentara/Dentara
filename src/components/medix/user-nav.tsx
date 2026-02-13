"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpCircle, LogOut, MessageCircle, Settings, User } from "lucide-react";
import NotificationDropdown from "./notification-dropdown";
import { ThemeToggle } from "./theme-toggle";

function initials(from?: string) {
  const s = (from || "").trim();
  if (!s) return "U";
  const parts = s.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (s.includes("@")) return s[0].toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

export function UserNav() {
  const { data } = useSession();
  const user = (data?.user as any) || {};
  const name = user.name || user.email || "User";
  const email = user.email || "";
  const role = user.role || "";
  const image = user.image || "";

  // 🔽 Bell üçün scope və (əgər varsa) “View all” linki
  const notifScope = role === "doctor" ? "doctor" : role === "clinic" ? "clinic" : "patient";
  const notifHref =
    role === "doctor"
      ? "/dashboard/doctor-self/notifications"
      : role === "clinic"
      ? "/dashboard/clinic/notifications"
      : undefined; // patient üçün hələ səhifə yoxdursa gizlədək

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <NotificationDropdown scope={notifScope} viewHref={notifHref} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              {email ? <p className="text-xs leading-none text-muted-foreground">{email}</p> : null}
              {role ? <p className="text-[11px] leading-none text-muted-foreground">Role: {role}</p> : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/clinic/profile" className="flex items-center gap-2">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/clinic/chat" className="flex items-center gap-2">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Chat</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/clinic/support" className="flex items-center gap-2">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/clinic/settings" className="flex items-center gap-2">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
