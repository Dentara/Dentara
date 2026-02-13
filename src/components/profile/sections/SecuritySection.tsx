// components/profile/sections/SecuritySection.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * UNIVERSAL Security section
 * - Works for patient/doctor/clinic with apiBase fallback
 * - Primary endpoints (independent of role):
 *    GET  /api/account/security/status         -> { ok, email, emailVerified:boolean }
 *    POST /api/account/resend-verification     -> { ok, alreadyVerified? , verifyUrl? }
 * - Fallbacks (legacy per-role):
 *    GET  ${apiBase}/profile                   -> { user:{ emailVerified:boolean } }
 *    POST ${apiBase}/security/resend-verification
 *    POST ${apiBase}/security/change-password
 */
export default function SecuritySection({
  user,
  apiBase = "/api/patient",
}: {
  user: any;
  apiBase?: string;
}) {
  const [verified, setVerified] = React.useState<boolean>(!!user?.emailVerified);
  const [busyVerify, setBusyVerify] = React.useState(false);
  const [msgVerify, setMsgVerify] = React.useState<string | null>(null);

  const [oldPwd, setOldPwd] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
  const [busyPwd, setBusyPwd] = React.useState(false);
  const [msgPwd, setMsgPwd] = React.useState<string | null>(null);
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  // --- helpers ---------------------------------------------------------------
  async function fetchLiveStatus(): Promise<boolean> {
    // 1) Try role-agnostic endpoint
    try {
      const r = await fetch(`/api/account/security/status?ts=${Date.now()}`, {
        cache: "no-store",
      });
      if (r.ok) {
        const j = await r.json();
        if (typeof j?.emailVerified === "boolean") return !!j.emailVerified;
      }
    } catch {}
    // 2) Fallback to legacy per-role profile
    try {
      const r = await fetch(`${apiBase}/profile?ts=${Date.now()}`, {
        cache: "no-store",
      });
      if (r.ok) {
        const j = await r.json();
        if (typeof j?.user?.emailVerified === "boolean")
          return !!j.user.emailVerified;
      }
    } catch {}
    return !!user?.emailVerified;
  }

  React.useEffect(() => {
    void fetchLiveStatus().then(setVerified);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  async function onResendVerification() {
    setMsgVerify(null);
    setBusyVerify(true);
    try {
      // 1) Primary independent endpoint
      let r = await fetch(`/api/account/resend-verification`, {
        method: "POST",
      });
      // 2) If not available, fallback to legacy per-role
      if (!r.ok) {
        r = await fetch(`${apiBase}/security/resend-verification`, {
          method: "POST",
        });
      }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");

      // If already verified on server
      if (j?.alreadyVerified) {
        setVerified(true);
        setMsgVerify("Already verified.");
        return;
      }

      // In dev, we may receive a verifyUrl to open
      if (j?.verifyUrl) {
        try {
          window.open(j.verifyUrl, "_blank", "noopener,noreferrer");
        } catch {}
      }

      // Recheck status after a short delay (give server time to update)
      setMsgVerify("Verification email sent. Please check your inbox.");
      setTimeout(async () => {
        const live = await fetchLiveStatus();
        setVerified(live);
      }, 1500);
    } catch (e: any) {
      setMsgVerify(e?.message || "Error");
    } finally {
      setBusyVerify(false);
    }
  }

  async function onChangePassword() {
    setMsgPwd(null);
    setBusyPwd(true);
    try {
      const r = await fetch(`${apiBase}/security/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");
      setMsgPwd("Password updated");
      setOldPwd("");
      setNewPwd("");
    } catch (e: any) {
      setMsgPwd(e?.message || "Error");
    } finally {
      setBusyPwd(false);
    }
  }

  const pwdValid = newPwd.length >= 8 && !!oldPwd;

  // --- UI --------------------------------------------------------------------
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Email verification */}
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Status</div>
        <div className="flex items-center gap-2">
          <b>Email verified:</b>
          <Badge variant={verified ? "secondary" : "outline"}>
            {verified ? "VERIFIED" : "NOT VERIFIED"}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="ml-1"
            onClick={() => fetchLiveStatus().then(setVerified)}
            title="Refresh status"
          >
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onResendVerification}
            disabled={busyVerify || verified}
            title={verified ? "Already verified" : undefined}
          >
            {busyVerify ? "Sending..." : "Resend verification email"}
          </Button>
          {msgVerify && (
            <span className="text-xs text-muted-foreground">{msgVerify}</span>
          )}
        </div>
      </div>

      {/* Change password */}
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Change password</div>
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            className="border rounded-md px-3 py-2 w-full pr-16"
            placeholder="Current password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline"
            onClick={() => setShowOld((x) => !x)}
          >
            {showOld ? "Hide" : "Show"}
          </button>
        </div>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            className="border rounded-md px-3 py-2 w-full pr-16"
            placeholder="New password (min 8 chars)"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline"
            onClick={() => setShowNew((x) => !x)}
          >
            {showNew ? "Hide" : "Show"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onChangePassword} disabled={!pwdValid || busyPwd}>
            {busyPwd ? "Saving..." : "Update"}
          </Button>
          {msgPwd && (
            <span className="text-xs text-muted-foreground">{msgPwd}</span>
          )}
        </div>
      </div>
    </div>
  );
}
