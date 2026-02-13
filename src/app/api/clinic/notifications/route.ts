import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "nodejs";

type FeedItemFromFeed = {
  kind?: string | null;
  title: string;
  message: string;
  createdAt: string;
  href?: string | null;
};

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

function isToday(d: Date) {
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

/**
 * Lightweight summary for bell dropdown.
 * Reads from /api/clinic/notifications/feed
 */
export async function GET(request: Request) {
  let items: FeedItemFromFeed[] = [];

  try {
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    const hdrs = await headers();
    const cookie = hdrs.get("cookie") ?? "";

    const res = await fetch(
      `${origin}/api/clinic/notifications/feed?limit=50`,
      {
        cache: "no-store",
        headers: { cookie },
      }
    );

    if (res.ok) {
      const j = (await res.json()) as { items?: FeedItemFromFeed[] };
      items = j.items ?? [];
    } else {
      items = [];
    }
  } catch (e) {
    console.error("[clinic/notifications] feed fetch error", e);
    items = [];
  }

  const groups: Groups = { unread: [], today: [], earlier: [] };

  for (const n of items) {
    const dt = new Date(n.createdAt);
    const base: FeedItem = {
      kind: (n.kind || "info") as FeedItem["kind"],
      title: n.title,
      message: n.message,
      time: dt.toLocaleString(),
      href: n.href ?? undefined,
    };

    // Hələlik bütün eventlər unread:
    groups.unread.push(base);

    if (isToday(dt)) {
      groups.today.push(base);
    } else {
      groups.earlier.push(base);
    }
  }

  return NextResponse.json({
    groups,
    settings: undefined,
  });
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
