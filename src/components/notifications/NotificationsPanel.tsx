"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FeedItem = {
  kind: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  createdAt: string; // ISO
  type?: string | null;
  membershipId?: string | null;
  href?: string | null;
};

export default function NotificationsPanel({
  scope,
}: {
  scope: "clinic" | "doctor";
}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/${scope}/notifications/feed?limit=50`, {
        cache: "no-store",
      });
      const j = await res.json();
      setItems(j.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [scope]);

  async function handleMembershipAction(
    membershipId: string,
    action: "approve" | "reject"
  ) {
    if (scope !== "clinic") return;
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
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        {items.length > 0 && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch(`/api/${scope}/notifications/mark-all-read`, {
                method: "POST",
              });
              await load();
            }}
          >
            <Button variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No notifications.</div>
        ) : (
          <ul className="space-y-2">
            {items.map((n, i) => {
              const isJoin =
                scope === "clinic" &&
                n.type === "PATIENT_JOIN_REQUEST" &&
                n.membershipId;

              return (
                <li key={i} className="rounded border p-3">
                  <div className="text-sm font-medium">
                    {n.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {n.message}
                  </div>
                  {isJoin && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 border rounded"
                        disabled={submittingId === n.membershipId}
                        onClick={() =>
                          handleMembershipAction(
                            n.membershipId as string,
                            "reject"
                          )
                        }
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 border rounded bg-primary text-primary-foreground"
                        disabled={submittingId === n.membershipId}
                        onClick={() =>
                          handleMembershipAction(
                            n.membershipId as string,
                            "approve"
                          )
                        }
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
