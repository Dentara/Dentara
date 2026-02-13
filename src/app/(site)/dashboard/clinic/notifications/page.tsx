"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

type Item = {
  kind: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  createdAt: string; // ISO
  type?: string | null;
  membershipId?: string | null;
  href?: string | null;
};

function icon(kind: Item["kind"]) {
  const base = "inline-block w-2.5 h-2.5 rounded-full";
  switch (kind) {
    case "success":
      return <span className={`${base} bg-green-500`} />;
    case "warning":
      return <span className={`${base} bg-amber-500`} />;
    case "danger":
      return <span className={`${base} bg-red-500`} />;
    default:
      return <span className={`${base} bg-blue-500`} />;
  }
}

export default function  ClinicNotificationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/clinic/notifications/feed?limit=100", {
        cache: "no-store",
      });
      const j = (await r.json()) as { items: Item[] };
      setItems(j.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMembershipAction(
    membershipId: string,
    action: "approve" | "reject"
  ) {
    try {
      setSubmittingId(membershipId);
      const res = await fetch(`/api/patients/${membershipId}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        console.error("Membership action failed", data);
        return;
      }
      await load();
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Recent events from your clinic data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetch("/api/clinic/notifications/mark-all-read", {
                method: "POST",
              }).catch(() => {});
              await load();
            }}
          >
            Mark all as read
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All notifications</CardTitle>
        <CardDescription>
            {loading ? "Loading..." : `${items.length} items`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((n, i) => {
              const isJoin =
                n.type === "PATIENT_JOIN_REQUEST" && n.membershipId;

              return (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0"
                >
                  <div className="flex flex-1 items-start gap-3">
                    <div className="mt-0.5">{icon(n.kind)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {n.message}
                      </p>

                      {isJoin && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={submittingId === n.membershipId}
                            onClick={() =>
                              handleMembershipAction(
                                n.membershipId as string,
                                "reject"
                              )
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={submittingId === n.membershipId}
                            onClick={() =>
                              handleMembershipAction(
                                n.membershipId as string,
                                "approve"
                              )
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {new Date(n.createdAt).toLocaleString()}
                  </Badge>
                </div>
              );
            })}
            {!loading && items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No notifications yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
