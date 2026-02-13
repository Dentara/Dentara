"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ContactSection({ user, apiBase = "/api/patient" }: { user: any; apiBase?: string }) {
  const [form, setForm] = React.useState({
    name: user?.name || "", phone: user?.phone || "",
    addressLine1: user?.addressLine1 || "", addressLine2: user?.addressLine2 || "",
    city: user?.city || "", country: user?.country || "",
  });
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try { const r = await fetch(`${apiBase}/profile`, { cache: "no-store" }); const j = await r.json();
        if (j?.user) setForm((o) => ({ ...o, ...j.user })); } catch {}
    })();
  }, [apiBase]);

  async function onSave() {
    try {
      setSaving(true); setMsg(null);
      const r = await fetch(`${apiBase}/profile`, { method: "PATCH", headers: { "Content-Type":"application/json" }, body: JSON.stringify(form) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");
      setMsg("Saved");
    } catch (e:any) { setMsg(e?.message || "Error"); }
    finally { setSaving(false); }
  }

  const field = (label:string, key: keyof typeof form, type="text", placeholder="") => (
    <div className="grid gap-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <input type={type} className="border rounded-md px-3 py-2" value={(form[key] as any)||""}
        placeholder={placeholder} onChange={(e)=>setForm({ ...form, [key]: e.target.value })}/>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Contact</div>
        {field("Full name","name","text","Your full name")}
        {field("Phone","phone","tel","+994...")}
      </div>
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Address</div>
        {field("Address line 1","addressLine1")}
        {field("Address line 2","addressLine2")}
        {field("City","city")}
        {field("Country","country")}
      </div>
      <div className="md:col-span-2 flex items-center gap-2">
        <Button onClick={onSave} disabled={saving} size="sm">{saving ? "Saving..." : "Save"}</Button>
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}
