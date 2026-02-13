// src/components/auth/CaptchaField.tsx
"use client";

import { useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

type CaptchaFieldProps = {
  onTokenChange: (token: string | null) => void;
};

export function CaptchaField({ onTokenChange }: CaptchaFieldProps) {
  const captchaRef = useRef<HCaptcha | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

  if (!siteKey) {
    // Dev mühitində sitekey qoyulmayıbsa sadəcə info göstərək
    return (
      <p className="text-xs text-orange-600">
        hCaptcha is not configured (missing NEXT_PUBLIC_HCAPTCHA_SITEKEY).
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-600">Bot protection</p>
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={(token) => onTokenChange(token)}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
      />
    </div>
  );
}
