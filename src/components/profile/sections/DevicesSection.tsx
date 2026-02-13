"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

type SessionRow = { id: string; deviceShort: string; ip: string; lastSeen: string; current: boolean };

export default function DevicesSection({ apiBase = "/api/account" }:{ apiBase?: string }) {
  const [rows, setRows] = React.useState<SessionRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [working, setWorking] = React.useState(false);

  // 1) Heartbeat (bu cihazı qeyd et)
  React.useEffect(() => {
    let timer: any;
    (async () => {
      try {
        await fetch(`${apiBase}/sessions/heartbeat`, { method: "POST" });
      } catch {}
      await load();                    // heartbeat-dən SONRA siyahını çək
      timer = setInterval(load, 60_000); // hər 60 saniyədən bir yenilə
    })();
    return () => timer && clearInterval(timer);
  }, [apiBase]);

  // 2) Siyahını yüklə
  async function load() {
    try {
      setLoading(true);
      const r = await fetch(`${apiBase}/sessions`, { cache: "no-store" });
      const j = await r.json();
      setRows(Array.isArray(j?.sessions) ? j.sessions : []);
    } catch {
      setMsg("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(()=>{ void load(); }, [apiBase]);

  // 3) Digərlərindən çıxış
  async function signOutOthers() {
    try {
      setWorking(true); setMsg(null);
      const r = await fetch(`${apiBase}/sessions?except=this`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed");
      await load();
      setMsg("Other devices revoked.");
    } catch (e:any) {
      setMsg(e?.message || "Error");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Active sessions</div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2">Device</th>
              <th className="text-left px-3 py-2">IP</th>
              <th className="text-left px-3 py-2">Last seen</th>
              <th className="text-left px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={4}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={4}>No active sessions.</td></tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{s.deviceShort}</td>
                  <td className="px-3 py-2">{s.ip}</td>
                  <td className="px-3 py-2">{new Date(s.lastSeen).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.current ? "This device" : ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={signOutOthers}
          disabled={working || rows.filter(r=>!r.current).length===0}
          title={rows.filter(r=>!r.current).length===0 ? "No other devices" : "Sign out from other devices"}
        >
          {working ? "Working..." : "Sign out from other devices"}
        </Button>
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}
