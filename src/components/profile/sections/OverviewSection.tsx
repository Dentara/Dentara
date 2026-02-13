"use client";
import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import JoinClinicInline from "@/components/doctor/JoinClinicInline";

export default function OverviewSection({
  user, linkedClinicsCount, basePath="/dashboard/patient-self", contextRole="patient", apiBase="/api/patient",
}: { user:any; linkedClinicsCount:number; basePath?:string; contextRole?: "patient"|"doctor"; apiBase?:string }) {
  const [filesCount, setFilesCount] = React.useState<number|null>(null);
  const [lastExport, setLastExport] = React.useState<string|null>(null);
  const [myPatientsCount, setMyPatientsCount] = React.useState<number|null>(null);

  React.useEffect(()=> {
    if (contextRole==="patient") {
      (async()=>{ try{ const r=await fetch(`${apiBase}/files?limit=1`,{cache:"no-store"}); const j=await r.json();
        const arr=Array.isArray(j?.files)?j.files:[]; setFilesCount(arr.length||null);} catch{ setFilesCount(null);} })();
    }
    if (contextRole==="doctor") {
      (async()=>{ try{ const r=await fetch(`/api/doctor/patients`,{cache:"no-store"}); const j=await r.json();
        const arr=Array.isArray(j?.patients)?j.patients:[]; setMyPatientsCount(arr.length);} catch{ setMyPatientsCount(null);} })();
    }
    if (typeof document!=="undefined") {
      const m=document.cookie.match(/(?:^|;\s*)tgz_last_export=([^;]+)/);
      if (m){ try{ setLastExport(new Date(decodeURIComponent(m[1])).toLocaleString()); }catch{ setLastExport(null);} }
    }
  },[contextRole, apiBase]);

  const manageClinicsOpenHref = contextRole==="doctor" ? "/dashboard/doctor-self/appointments" : `${basePath}/clinics`;
  const secondActionTitle = contextRole==="doctor" ? "My Patients" : "Open My Records";
  const secondActionDesc = contextRole==="doctor" ? "List and manage your private patients." : "View and download your files.";
  const secondActionHref = contextRole==="doctor" ? "/dashboard/doctor-self/patients" : `${basePath}/files`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Account</div>
        <div className="rounded-xl border p-4 shadow-sm bg-background/50">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1"><div className="text-xs text-muted-foreground">Full name</div><div className="font-medium">{user?.name || "—"}</div></div>
            <div className="space-y-1"><div className="text-xs text-muted-foreground">Role</div><div><Badge variant="outline">{String(user?.role||"").toUpperCase()}</Badge></div></div>
            <div className="space-y-1"><div className="text-xs text-muted-foreground">Email</div><div className="truncate">{user?.email || "—"}</div></div>
            <div className="space-y-1"><div className="text-xs text-muted-foreground">Language / Timezone</div><div>{(user?.language||"EN").toUpperCase()} · {user?.timezone||"UTC"}</div></div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4 bg-background/50"><div className="text-xs text-muted-foreground">Linked clinics</div><div className="text-2xl font-semibold mt-1">{linkedClinicsCount}</div></div>
          {contextRole==="patient"
            ? <div className="rounded-xl border p-4 bg-background/50"><div className="text-xs text-muted-foreground">My records</div><div className="text-2xl font-semibold mt-1">{filesCount ?? "—"}</div></div>
            : <div className="rounded-xl border p-4 bg-background/50"><div className="text-xs text-muted-foreground">My patients</div><div className="text-2xl font-semibold mt-1">{myPatientsCount ?? "—"}</div></div>}
          <div className="rounded-xl border p-4 bg-background/50"><div className="text-xs text-muted-foreground">Last export</div><div className="mt-1 text-sm">{lastExport || "—"}</div></div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Quick actions</div>
        <div className="rounded-xl border p-4 shadow-sm bg-background/50 space-y-3">
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div><div className="font-medium">Manage Linked Clinics</div><div className="text-xs text-muted-foreground">Connect to a clinic or open calendar.</div></div>
            {contextRole==="doctor"
              ? <div className="flex items-center gap-2"><JoinClinicInline /><Button asChild variant="outline" size="sm"><Link href={manageClinicsOpenHref}>Open</Link></Button></div>
              : <Button asChild variant="outline" size="sm"><Link href={manageClinicsOpenHref}>Open</Link></Button>}
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div><div className="font-medium">{secondActionTitle}</div><div className="text-xs text-muted-foreground">{secondActionDesc}</div></div>
            <Button asChild variant="outline" size="sm"><Link href={secondActionHref}>Open</Link></Button>
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div><div className="font-medium">Export my data</div><div className="text-xs text-muted-foreground">Download ZIP (CSV) or JSON export.</div></div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild><a href={`${apiBase}/data/export/zip`}>ZIP</a></Button>
              <Button variant="outline" size="sm" asChild><a href={`${apiBase}/data/export`}>JSON</a></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
