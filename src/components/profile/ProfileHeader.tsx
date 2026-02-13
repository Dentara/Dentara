"use client";

import Image from "next/image";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  email: string;
  role: string;
  linkedClinicsCount: number;
  avatarUrl?: string | null;
  apiBase?: string; // NEW
};

export default function ProfileHeader({
  name, email, role, linkedClinicsCount, avatarUrl, apiBase = "/api/patient",
}: Props) {
  const seed = encodeURIComponent(name || email || "U");
  const dicebear = `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
  const [img, setImg] = React.useState<string>(avatarUrl || dicebear);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (avatarUrl) return;
    (async () => {
      try {
        const r = await fetch(`${apiBase}/profile`, { cache: "no-store" });
        const j = await r.json();
        if (j?.user?.avatarUrl) setImg(j.user.avatarUrl);
      } catch {}
    })();
  }, [apiBase, avatarUrl]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    try {
      setBusy(true);
      const r = await fetch(`${apiBase}/profile/avatar`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.url) setImg(j.url);
      else alert(j?.error || "Upload failed");
    } catch {
      alert("Upload error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border bg-muted">
          <Image src={img} alt="avatar" fill sizes="64px" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold leading-none truncate">{name}</h2>
            <Badge variant="secondary">{String(role || "PATIENT").toUpperCase()}</Badge>
          </div>
          <div className="text-sm text-muted-foreground truncate">{email}</div>
          <div className="mt-2 text-xs">
            <span className="text-muted-foreground">Linked clinics:</span>{" "}
            <span className="font-medium">{linkedClinicsCount}</span>
          </div>
        </div>

        <div className="shrink-0">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          <Button variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Uploading..." : "Change photo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
