"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

type Props = {
  triggerLabel?: string;
  onSuccess?: () => void;
};

const ALL_SCOPES = ["xrays", "attachments", "charts", "billing"] as const;

export default function GrantForm({ triggerLabel = "New Grant", onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [granteeType, setGranteeType] = useState<"clinic" | "doctor">("clinic");
  const [granteeEmail, setGranteeEmail] = useState("");
  const [scopes, setScopes] = useState<string[]>(["xrays", "attachments"]);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const toggleScope = (s: string) => {
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patient/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          granteeType,
          granteeEmail: granteeEmail.trim(),
          scopes,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error || "Grant creation failed");
        return;
      }
      alert("Grant created successfully");
      setOpen(false);
      setGranteeEmail("");
      setScopes(["xrays", "attachments"]);
      setExpiresAt("");
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("Unexpected error");
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
            <AlertDialogTitle>Create Data Access Grant</AlertDialogTitle>
            <AlertDialogDescription>Share specific patient data with a clinic or a doctor.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Grantee Type</Label>
              <Select value={granteeType} onValueChange={(v: any) => setGranteeType(v)}>
                <SelectTrigger><SelectValue placeholder="Select grantee type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grantee Email</Label>
              <Input type="email" placeholder="clinic@example.com or doctor@example.com" value={granteeEmail} onChange={(e) => setGranteeEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_SCOPES.map((s) => (
                  <label key={s} className="flex items-center gap-2">
                    <Checkbox checked={scopes.includes(s)} onCheckedChange={() => toggleScope(s)} />
                    <span className="capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expires At (optional)</Label>
              <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              {expiresAt && (<p className="text-xs text-muted-foreground">Will expire: {format(new Date(expiresAt), "PPpp")}</p>)}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 text-white" disabled={loading || !granteeEmail} onClick={submit}>
              {loading ? "Creating..." : "Create"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
