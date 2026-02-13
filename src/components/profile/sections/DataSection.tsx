"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

export default function DataSection({ apiBase = "/api/patient" }:{ apiBase?:string }) {
  const [privacy, setPrivacy] = React.useState({ showNameToLinkedClinics:true, shareRecordsByDefault:false });
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string|null>(null);

  React.useEffect(()=>{ (async()=>{
    try { const r = await fetch(`${apiBase}/privacy`, { cache:"no-store" }); const j = await r.json();
      if (j?.privacy) setPrivacy(j.privacy); } catch {} })(); }, [apiBase]);

  async function onSavePrivacy() {
    try {
      setSaving(true); setMsg(null);
      const r = await fetch(`${apiBase}/privacy`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(privacy) });
      if (!r.ok) throw new Error("Failed");
      setMsg("Saved");
    } catch(e:any){ setMsg(e?.message || "Error"); } finally { setSaving(false); }
  }
  function onExportZip(){ window.location.href = `${apiBase}/data/export/zip`; }
  function onExportJson(){ window.location.href = `${apiBase}/data/export`; }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Privacy</div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={privacy.showNameToLinkedClinics}
            onChange={(e)=>setPrivacy({ ...privacy, showNameToLinkedClinics:e.target.checked })}/>
          Show my name to linked clinics
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={privacy.shareRecordsByDefault}
            onChange={(e)=>setPrivacy({ ...privacy, shareRecordsByDefault:e.target.checked })}/>
          Share my records by default (grants)
        </label>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onSavePrivacy} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Your data</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportZip}>ZIP</Button>
          <Button variant="outline" onClick={onExportJson}>JSON</Button>
        </div>
        <p className="text-xs text-muted-foreground">Export will download your profile, files, appointments and treatments.</p>
      </div>
    </div>
  );
}
