"use client";

import * as React from "react";
import { useState, useEffect } from "react";

type Cred = {
  id: string;
  title: string | null;
  issuedBy?: string | null;
  year?: number | null;
  isPublic: boolean;
  isVerified?: boolean | null;
  verifyRequested?: boolean | null;
  filePath?: string | null;
};

export default function CredentialsSection() {
  const [list, setList] = useState<Cred[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [year, setYear] = useState<string>("");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/doctor/credentials", { cache: "no-store" });
      const j = await r.json();
      setList(j?.items || []);
    } catch (e: any) {
      setMsg(e?.message || "Failed to load credentials");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { void load(); }, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMsg("Please choose a file.");
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title) fd.append("title", title);
      if (issuedBy) fd.append("issuedBy", issuedBy);
      if (year) fd.append("year", year);
      fd.append("isPublic", String(isPublic));
      const r = await fetch("/api/doctor/credentials", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Upload failed");
      setTitle(""); setIssuedBy(""); setYear(""); setIsPublic(true); setFile(null);
      const input = document.getElementById("cred-file") as HTMLInputElement | null;
      if (input) input.value = "";
      await load();
      setMsg("Credential uploaded");
    } catch (e: any) { setMsg(e?.message || "Upload error"); } finally { setBusy(false); }
  }

  async function togglePublic(id: string, next: boolean) {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(`/api/doctor/credentials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed");
      await load();
    } catch (e: any) { setMsg(e?.message || "Update error"); } finally { setBusy(false); }
  }

  async function requestVerify(id: string) {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(`/api/doctor/credentials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "requestVerify" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed");
      await load();
      setMsg("Verification requested. An admin will review it.");
    } catch (e: any) { setMsg(e?.message || "Request error"); } finally { setBusy(false); }
  }

  // Admin/manual approve (optional button görünməyəcək; ancaq istəsəniz göstərə bilərsiniz)
  async function approveVerify(id: string) {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(`/api/doctor/credentials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed");
      await load();
    } catch (e: any) { setMsg(e?.message || "Approve error"); } finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this credential?")) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(`/api/doctor/credentials/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Delete failed");
      await load();
    } catch (e: any) { setMsg(e?.message || "Delete error"); } finally { setBusy(false); }
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Diplomas & Certificates</h3>
        <p className="text-sm text-muted-foreground">
          Upload your credentials. Mark as <b>Public</b> to show on your public profile.
          Click <b>Request verification</b> to send for review. Verified items display a <b>VERIFIED</b> badge across the site.
        </p>
      </div>

      {/* Upload form */}
      <form onSubmit={onUpload} className="rounded border p-4 grid md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="e.g., Dental License"
                 value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Issued By</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="e.g., Ministry of Health"
                 value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Year</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="e.g., 2021"
                 inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">File (PDF/Image)</label>
          <input id="cred-file" type="file" accept="image/*,application/pdf"
                 onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="flex items-center gap-2">
          <input id="pub" type="checkbox" checked={isPublic}
                 onChange={(e) => setIsPublic(e.target.checked)} />
          <label htmlFor="pub" className="text-sm">Public</label>
        </div>
        <div className="flex items-center justify-end">
          <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60" disabled={busy}>
            {busy ? "Saving..." : "Upload"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-2">
        <h4 className="font-semibold">Your credentials</h4>
        {busy && <p className="text-sm text-muted-foreground">Working…</p>}
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No credentials yet.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((c) => (
              <li key={c.id} className="rounded border p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {c.title || "Credential"}
                    {c.isVerified ? (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">VERIFIED</span>
                    ) : c.verifyRequested ? (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">PENDING</span>
                    ) : (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">UNVERIFIED</span>
                    )}
                    {c.isPublic ? (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">PUBLIC</span>
                    ) : (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">PRIVATE</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {[c.issuedBy, c.year ? String(c.year) : ""].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.filePath ? (
                    <a href={c.filePath} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                  <button className="text-xs px-2 py-1 rounded border" onClick={() => togglePublic(c.id, !c.isPublic)} disabled={busy}>
                    {c.isPublic ? "Make Private" : "Make Public"}
                  </button>

                  {/* Request verification button (no auto-verify anymore) */}
                  {!c.isVerified && !c.verifyRequested && (
                    <button className="text-xs px-2 py-1 rounded border" onClick={() => requestVerify(c.id)} disabled={busy}>
                      Request verification
                    </button>
                  )}
                  {/* OPTIONAL admin control (göstərmək istəməsən, silə bilərsən) */}
                  {/* {c.verifyRequested && !c.isVerified && (
                    <button className="text-xs px-2 py-1 rounded border" onClick={() => approveVerify(c.id)} disabled={busy}>
                      Approve (admin)
                    </button>
                  )} */}

                  <button className="text-xs px-2 py-1 rounded border text-red-600" onClick={() => onDelete(c.id)} disabled={busy}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
