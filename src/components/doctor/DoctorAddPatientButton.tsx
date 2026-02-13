"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = { linked: boolean };

type Step = "linked-info" | "noClinic-options" | "private-confirm" | "form";

export default function DoctorAddPatientButton({ linked }: Props) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>(linked ? "linked-info" : "noClinic-options");
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // form state
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  function onClick() {
    setOpen(true);
    setMsg(null);
    setStep(linked ? "linked-info" : "noClinic-options");
  }

  async function onSubmit() {
    try {
      setSaving(true);
      setMsg(null);
      const r = await fetch("/api/doctor/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");
      setMsg("Patient created and linked to your private workspace.");
      setTimeout(() => window.location.reload(), 700);
    } catch (e: any) {
      setMsg(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  const canSave = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);

  return (
    <>
      <Button variant="outline" size="sm" onClick={onClick}>Create patient</Button>

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-background shadow-lg">
            <div className="p-4 border-b font-medium">Create patient</div>
            <div className="p-4 space-y-4">
              {/* CASE A — Doctor clinicə LINKLİDİR */}
              {step === "linked-info" && (
                <>
                  <p className="text-sm">
                    You are <b>linked to a clinic</b>. New patients should normally be created by the clinic flow.
                  </p>
                  <div className="grid gap-2 sm:flex sm:items-center sm:gap-2">
                    {/* Klinik axına yönləndir (sənin add səhifən) */}
                    <Button asChild size="sm" variant="outline" title="Use clinic flow">
                      <Link href="/dashboard/patients/add?next=/dashboard/doctor-self/patients">Go to clinic add</Link>
                    </Button>
                    {/* Yenə də private yaratmaq istəyirsə → təsdiq */}
                    <Button size="sm" onClick={() => setStep("private-confirm")} title="Create a private (non-clinic) patient">
                      Create private patient
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
                  </div>
                </>
              )}

              {/* CASE B — Doctor clinicə LINKLİ DEYİL */}
              {step === "noClinic-options" && (
                <>
                  <p className="text-sm">
                    You are <b>not linked to any clinic</b>. You can either link to a clinic or create a private patient under your workspace.
                  </p>
                  <div className="grid gap-2 sm:flex sm:items-center sm:gap-2">
                    {/* Link to clinic (sənin Join düymən doctor dashboarddadır) */}
                    <Button asChild size="sm" variant="outline" title="Open Join Clinic page">
                      <Link href="/dashboard/doctor-self">Link to a clinic</Link>
                    </Button>
                    <Button size="sm" onClick={() => setStep("form")}>Create private patient</Button>
                    <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
                  </div>
                </>
              )}

              {/* PRIVATE CONFIRM */}
              {step === "private-confirm" && (
                <>
                  <p className="text-sm">
                    This new patient will be <b>not associated with any clinic</b> and will be visible to you and the patient only.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setStep("linked-info")}>Back</Button>
                    <Button size="sm" onClick={() => setStep("form")}>I understand, continue</Button>
                  </div>
                </>
              )}

              {/* PRIVATE FORM */}
              {step === "form" && (
                <>
                  <div className="grid gap-3">
                    <div className="grid gap-1">
                      <label className="text-sm text-muted-foreground">Full name</label>
                      <input className="border rounded-md px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Patient name" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm text-muted-foreground">Email</label>
                      <input className="border rounded-md px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm text-muted-foreground">Phone (optional)</label>
                      <input className="border rounded-md px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+994..." />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={()=>setOpen(false)}>Close</Button>
                    <Button size="sm" onClick={onSubmit} disabled={!canSave || saving}>
                      {saving ? "Saving..." : "Create"}
                    </Button>
                    {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
