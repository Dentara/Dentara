// app/api/doctor/notifications/route.ts
import { NextResponse } from "next/server";

type FeedItem = { kind: "info" | "success" | "warning" | "danger"; title: string; message: string; createdAt: string };

function isToday(d: Date) {
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export async function GET(request: Request) {
  let items: FeedItem[] = [];
  try {
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;
    const res = await fetch(`${origin}/api/doctor/notifications/feed?limit=50`, { cache: "no-store" });
    if (res.ok) {
      const j = (await res.json()) as { items?: FeedItem[] };
      items = j.items ?? [];
    }
  } catch { items = []; }

  const unread: any[] = [];
  const today: any[] = [];
  const earlier: any[] = [];

  for (const n of items) {
    const dt = new Date(n.createdAt);
    const base = { kind: n.kind ?? "info", title: n.title, message: n.message, time: dt.toLocaleString() };
    if (isToday(dt)) today.push(base); else earlier.push(base);
  }

  return NextResponse.json({ groups: { unread, today, earlier } });
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
