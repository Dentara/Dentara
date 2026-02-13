// src/components/auth/LegalConsentCheckbox.tsx
"use client";

import Link from "next/link";

type Role = "patient" | "doctor" | "clinic";

type Props = {
  role: Role;
  checked: boolean;
  onChange: (value: boolean) => void;
};

const roleLabels: Record<Role, string> = {
  patient:
    "By creating a Tagiza patient account, you agree to the Terms of Service, Privacy Policy and Medical & AI Consent.",
  doctor:
    "By creating a Tagiza doctor account, you confirm that you are a licensed professional and agree to the Terms of Service, Privacy Policy and Medical & AI Consent.",
  clinic:
    "By registering a clinic on Tagiza, you confirm that you are authorised to represent this organisation and agree to the Terms of Service, Privacy Policy and Medical & AI Consent.",
};

export function LegalConsentCheckbox({ role, checked, onChange }: Props) {
  return (
    <label className="flex items-start gap-2 text-xs text-gray-600">
      <input
        type="checkbox"
        className="mt-0.5"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        {roleLabels[role].replace("Terms of Service", "").replace("Privacy Policy", "") /* base text */}
        {/* daha çox kontrollu linklərlə yazırıq */}
        {role === "patient" && (
          <>
            By creating a Tagiza patient account, you agree to the{" "}
            <Link href="/legal/terms" className="underline">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/legal/medical-consent" className="underline">
              Medical &amp; AI Consent
            </Link>
            .
          </>
        )}
        {role === "doctor" && (
          <>
            By creating a Tagiza doctor account, you confirm that you are a licensed
            professional and agree to the{" "}
            <Link href="/legal/terms" className="underline">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/legal/medical-consent" className="underline">
              Medical &amp; AI Consent
            </Link>
            .
          </>
        )}
        {role === "clinic" && (
          <>
            By registering a clinic on Tagiza, you confirm that you are authorised to
            represent this organisation and agree to the{" "}
            <Link href="/legal/terms" className="underline">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/legal/medical-consent" className="underline">
              Medical &amp; AI Consent
            </Link>
            .
          </>
        )}
      </span>
    </label>
  );
}
