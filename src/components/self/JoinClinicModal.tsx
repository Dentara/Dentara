"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  triggerLabel?: string;
  defaultMode?: "inviteCode" | "clinicEmail";
  onSuccess?: () => void;
};

export default function JoinClinicModal({ triggerLabel = "Join Clinic", defaultMode = "inviteCode", onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"inviteCode" | "clinicEmail">(defaultMode);
  const [inviteCode, setInviteCode] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const body: any = { mode };
      if (mode === "inviteCode") body.inviteCode = inviteCode.trim();
      else body.clinicEmail = clinicEmail.trim();

      const res = await fetch("/api/self/join-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error || "Join request failed.");
        return;
      }
      alert("Request submitted successfully!");
      setOpen(false);
      setInviteCode("");
      setClinicEmail("");
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Join Clinic</AlertDialogTitle>
            <AlertDialogDescription>
              Join a clinic using an invite code or the clinic’s email.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Join method</div>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inviteCode">Invite Code</SelectItem>
                  <SelectItem value="clinicEmail">Clinic Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "inviteCode" ? (
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            ) : (
              <Input
                type="email"
                placeholder="clinic@example.com"
                value={clinicEmail}
                onChange={(e) => setClinicEmail(e.target.value)}
              />
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 text-white"
              disabled={loading || (mode === "inviteCode" ? !inviteCode.trim() : !clinicEmail.trim())}
              onClick={submit}
            >
              {loading ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
