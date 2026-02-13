// src/lib/hcaptcha.ts
const HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify";

export async function verifyHCaptchaToken(token: string, remoteIp?: string | null) {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    // Əgər secret qoyulmayıbsa, dev mühitində captcha-nı "pass" kimi qəbul edirik
    // PROD-da mütləq doldurulmalıdır.
    return { ok: true, reason: "HCAPTCHA_SECRET not set (dev mode)" };
  }

  const form = new URLSearchParams();
  form.append("secret", secret);
  form.append("response", token);
  if (remoteIp) {
    form.append("remoteip", remoteIp);
  }

  const res = await fetch(HCAPTCHA_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!res.ok) {
    return { ok: false, reason: `hCaptcha HTTP ${res.status}` };
  }

  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };

  if (!data.success) {
    return {
      ok: false,
      reason: `hCaptcha failed: ${(data["error-codes"] || []).join(", ")}`,
    };
  }

  return { ok: true, reason: "verified" };
}
