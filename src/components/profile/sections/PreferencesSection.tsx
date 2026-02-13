"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

type Prefs = { language:string; timezone:string; emailNotifications:string; marketingOptIn:boolean };
const LANGS = ["en","az","ru"];
const TIMEZONES = ["UTC","Asia/Baku","Europe/Berlin","America/New_York"];
const EMAIL_LEVELS = ["ALL","IMPORTANT","NONE"];

export default function PreferencesSection({ user, apiBase = "/api/patient" }: { user:any; apiBase?:string }) {
  const [prefs, setPrefs] = React.useState<Prefs>({
    language: user?.language || "en", timezone: user?.timezone || "UTC",
    emailNotifications: user?.emailNotifications || "IMPORTANT", marketingOptIn: !!user?.marketingOptIn,
  });
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => { (async () => {
    try { const r = await fetch(`${apiBase}/preferences`, { cache: "no-store" }); const j = await r.json();
      if (j?.prefs) setPrefs(j.prefs); } catch {} })(); }, [apiBase]);

  async function onSave() {
    try {
      setSaving(true); setMsg(null);
      const r = await fetch(`${apiBase}/preferences`, { method: "PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(prefs) });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(j?.error || "Failed");
      setMsg("Saved");
    } catch(e:any){ setMsg(e?.message || "Error"); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Localization</div>
        <label className="text-sm">Language</label>
        <select className="border rounded-md px-3 py-2" value={prefs.language} onChange={(e)=>setPrefs({ ...prefs, language:e.target.value })}>
          {LANGS.map(l=>(<option key={l} value={l}>{l.toUpperCase()}</option>))}
        </select>
        <label className="text-sm">Time zone</label>
        <select className="border rounded-md px-3 py-2" value={prefs.timezone} onChange={(e)=>setPrefs({ ...prefs, timezone:e.target.value })}>
          {TIMEZONES.map(t=>(<option key={t} value={t}>{t}</option>))}
        </select>
      </div>
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Notifications</div>
        <label className="text-sm">Email notifications</label>
        <select className="border rounded-md px-3 py-2" value={prefs.emailNotifications} onChange={(e)=>setPrefs({ ...prefs, emailNotifications:e.target.value })}>
          {EMAIL_LEVELS.map(x=>(<option key={x} value={x}>{x}</option>))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={prefs.marketingOptIn} onChange={(e)=>setPrefs({ ...prefs, marketingOptIn:e.target.checked })}/>
          Receive product updates
        </label>
        <div className="flex items-center gap-2">
          <Button onClick={onSave} disabled={saving} size="sm">{saving ? "Saving..." : "Save"}</Button>
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
