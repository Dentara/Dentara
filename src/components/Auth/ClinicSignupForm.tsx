// src/components/auth/ClinicSignupForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "./AuthCard";
import { LegalConsentCheckbox } from "./LegalConsentCheckbox";
import { CaptchaField } from "./CaptchaField";
import {
  validatePassword,
  PASSWORD_POLICY_MESSAGE,
  getPasswordStrength,
} from "@/lib/passwordPolicy";
import { COUNTRY_OPTIONS } from "./countryOptions";

async function safeParse(res: Response) {
  try {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  } catch {
    return null;
  }
}

export function ClinicSignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneLocal: "",
    address: "",
    country: "",
    city: "",
    phoneCountryCode: "+994",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [license, setLicense] = useState<File | null>(null);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(formData.password);

  const onCountryChange = (code: string) => {
    const opt = COUNTRY_OPTIONS.find((c) => c.code === code);
    setFormData((prev) => ({
      ...prev,
      country: opt?.name ?? "",
      phoneCountryCode: opt?.phoneCode ?? prev.phoneCountryCode,
    }));
  };

  const fullPhone = `${formData.phoneCountryCode} ${formData.phoneLocal}`.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptLegal) {
      setError("You must accept the Terms and Privacy Policy to register a clinic.");
      return;
    }
    if (!license) {
      setError("Clinic license document is required.");
      return;
    }

    const pwdCheck = validatePassword(formData.password);
    if (!pwdCheck.ok) {
      setError(pwdCheck.message || PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (formData.password.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the hCaptcha check.");
      return;
    }

    setLoading(true);

    const body = new FormData();
    body.append("name", formData.name);
    body.append("email", formData.email);
    body.append("password", formData.password);
    body.append("phone", fullPhone || "");
    body.append("address", formData.address);
    body.append("country", formData.country || "");
    body.append("city", formData.city || "");
    body.append("hasAcceptedTerms", "true");
    body.append("captchaToken", captchaToken);
    body.append("license", license);

    try {
      const res = await fetch("/api/auth/register/clinic", {
        method: "POST",
        body,
      });

      const data = await safeParse(res);

      if (!res.ok) {
        const msg = data?.error || data?.message || "Registration failed";
        throw new Error(msg);
      }

      router.push("/auth/signin?accountType=clinic&registered=1");
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStrengthBars = () => {
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-green-500"];
    const neutral = "bg-slate-200 dark:bg-slate-700";
    const activeCount = strength.score;

    const bars = [0, 1, 2, 3].map((idx) => {
      const active = activeCount > idx;
      const color = active ? colors[idx] : neutral;
      return (
        <div
          key={idx}
          className={`h-1.5 flex-1 rounded-full ${color} transition-colors`}
        />
      );
    });

    let label = "";
    if (strength.level === "very-weak" || strength.level === "weak") label = "Weak";
    else if (strength.level === "medium") label = "Medium";
    else if (strength.level === "strong") label = "Strong";

    return (
      <div className="mt-1 space-y-1">
        <div className="flex gap-1">{bars}</div>
        {formData.password && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Password strength: {label || "Weak"}. {PASSWORD_POLICY_MESSAGE}
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthCard
      title="Clinic Registration"
      subtitle="Create a secure workspace for your dental team."
    >
      <div className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Clinic Name"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Clinic Address"
            className="w-full border p-2 rounded"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          {/* Country + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              className="w-full border p-2 rounded text-sm"
              value={formData.country ? COUNTRY_OPTIONS.find((c) => c.name === formData.country)?.code || "" : ""}
              onChange={(e) => onCountryChange(e.target.value)}
            >
              <option value="">Select country</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City"
              className="w-full border p-2 rounded"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          {/* Phone with country code */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-600 dark:text-slate-300">Phone</span>
            <div className="flex gap-2">
              <select
                className="border p-2 rounded text-sm w-32"
                value={formData.phoneCountryCode}
                onChange={(e) =>
                  setFormData({ ...formData, phoneCountryCode: e.target.value })
                }
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.phoneCode}>
                    {c.phoneCode} {c.name}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Phone number"
                value={formData.phoneLocal}
                onChange={(e) => setFormData({ ...formData, phoneLocal: e.target.value })}
              />
            </div>
          </div>

          {/* Password + confirm */}
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border p-2 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {renderStrengthBars()}
          </div>

          <div className="space-y-1 text-sm">
            <p>Upload License Document (image/pdf)</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full border p-2 rounded"
              onChange={(e) => setLicense(e.target.files?.[0] || null)}
              required
            />
          </div>

          <CaptchaField onTokenChange={setCaptchaToken} />

          <LegalConsentCheckbox
            role="clinic"
            checked={acceptLegal}
            onChange={setAcceptLegal}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/signin?accountType=clinic" className="text-purple-600 underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
