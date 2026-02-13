"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, AlertCircle, CheckCircle2, Calendar, Filter } from "lucide-react";

type Notif = {
  kind: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  time: string; // hazırda API time string qaytarır
};
type Groups = { unread: Notif[]; today: Notif[]; earlier: Notif[] };

const Icon = ({ kind }: { kind: Notif["kind"] }) => {
  switch (kind) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "danger":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Calendar className="h-4 w-4 text-blue-500" />;
  }
};

export default function ClinicNotificationsPopover() {
  const [groups, setGroups] = useState<Groups>({ unread: [], today: [], earlier: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/clinic/notifications", { cache: "no-store" });
      const j = (await r.json()) as { groups: Groups };
      setGroups(j?.groups ?? { unread: [], today: [], earlier: [] });
    } catch {
      setGroups({ unread: [], today: [], earlier: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ilk açılışda yüklə
    load();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/clinic/notifications/mark-all-read", { method: "POST" });
      setGroups((g) => ({ unread: [], today: g.today, earlier: g.earlier }));
    } catch {}
  };

  const renderList = (list: Notif[]) => (
    <div className="space-y-3">
      {list.map((n, i) => (
        <div key={i} className="flex gap-3">
          <div className="mt-0.5">
            <Icon kind={n.kind} />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{n.title}</p>
            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{n.message}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
          </div>
        </div>
      ))}
      {!loading && list.length === 0 && (
        <p className="text-sm text-muted-foreground">No items.</p>
      )}
    </div>
  );

  const unreadCount = groups.unread.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <Badge className="ml-1 px-1.5 py-0 h-4">{unreadCount}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-medium">Notifications</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 px-2">
              Mark all as read
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-4 py-3 max-h-80 overflow-auto space-y-5">
          {loading ? (
            <div className="h-24 animate-pulse rounded-md bg-muted/40" />
          ) : (
            <>
              {renderList(groups.unread)}
              {renderList(groups.today)}
              {renderList(groups.earlier)}
            </>
          )}
        </div>

        <div className="px-4 py-3 border-t">
          <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
            <Link href="/dashboard/clinic/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
