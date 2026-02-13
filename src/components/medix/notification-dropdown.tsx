"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeedItem = {
  kind: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  time: string;
  href?: string | null;
};

type Groups = {
  unread: FeedItem[];
  today: FeedItem[];
  earlier: FeedItem[];
};

type Props = {
  scope?: "clinic" | "doctor" | "patient";
  /** Where "View all" button goes */
  viewHref?: string;
};

export default function NotificationDropdown({
  scope = "clinic",
  viewHref,
}: Props) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [groups, setGroups] = useState<Groups | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(true);

  async function loadCount() {
    try {
      setCountLoading(true);
      const res = await fetch(`/api/${scope}/notifications/unread-count`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setCount(0);
        return;
      }
      const j = await res.json();
      setCount(typeof j.count === "number" ? j.count : 0);
    } catch {
      setCount(0);
    } finally {
      setCountLoading(false);
    }
  }

  async function loadList() {
    try {
      setListLoading(true);
      const res = await fetch(`/api/${scope}/notifications`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setGroups({ unread: [], today: [], earlier: [] });
        return;
      }
      const j = await res.json();
      const g = (j.groups ?? {}) as Partial<Groups>;
      setGroups({
        unread: g.unread ?? [],
        today: g.today ?? [],
        earlier: g.earlier ?? [],
      });
    } catch {
      setGroups({ unread: [], today: [], earlier: [] });
    } finally {
      setListLoading(false);
    }
  }

  // poll only count; list-i dropdown açanda yükləyirik
  useEffect(() => {
    loadCount();
    const t = setInterval(loadCount, 30000);
    return () => clearInterval(t);
  }, [scope]);

  useEffect(() => {
    if (open) {
      loadList();
    }
  }, [open, scope]);

  const renderGroup = (label: string, items: FeedItem[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-2">
        <div className="px-2 text-xs font-semibold text-muted-foreground">
          {label}
        </div>
        <ul className="mt-1 space-y-1">
          {items.map((n, i) => {
            const inner = (
              <>
                <div className="text-xs font-medium">{n.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {n.message}
                </div>
                <div className="text-[10px] text-muted-foreground/70">
                  {n.time}
                </div>
              </>
            );

            return (
              <li key={i} className="rounded px-2 py-1 hover:bg-muted/70">
                {n.href ? (
                  <Link
                    href={n.href}
                    className="block"
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && !countLoading && (
          <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[10px] px-1">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] rounded-md border bg-popover shadow-lg z-50">
          <div className="max-h-96 overflow-auto p-2">
            {listLoading || !groups ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                Loading…
              </div>
            ) : groups.unread.length === 0 &&
              groups.today.length === 0 &&
              groups.earlier.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                No notifications.
              </div>
            ) : (
              <>
                {renderGroup("Unread", groups.unread)}
                {renderGroup("Today", groups.today)}
                {renderGroup("Earlier", groups.earlier)}
              </>
            )}
          </div>
          <div className="border-top border-t px-2 py-2 flex items-center justify-between">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch(`/api/${scope}/notifications/mark-all-read`, {
                  method: "POST",
                }).catch(() => {});
                await loadCount();
                await loadList();
              }}
            >
              <Button variant="outline" size="sm">
                Mark all read
              </Button>
            </form>
            {viewHref ? (
              <Link
                href={viewHref}
                className="text-sm text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
