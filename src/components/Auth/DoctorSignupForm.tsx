// src/components/auth/DoctorSignupForm.tsx
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

type Gender = "male" | "female" | "other" | "";

/**
 * Doctor signup (FormData + files + hCaptcha)
 */
export function DoctorSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneLocal: "",
    country: "",
    city: "",
    gender: "" as Gender,
    dateOfBirth: "",
    phoneCountryCode: "+994",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [diploma, setDiploma] = useState<File | null>(null);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const strength = getPasswordStrength(form.password);

  const onCountryChange = (code: string) => {
    const opt = COUNTRY_OPTIONS.find((c) => c.code === code);
    setForm((prev) => ({
      ...prev,
      country: opt?.name ?? "",
      phoneCountryCode: opt?.phoneCode ?? prev.phoneCountryCode,
    }));
  };

  const fullPhone = `${form.phoneCountryCode} ${form.phoneLocal}`.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idDocument || !diploma) {
      setErr("ID document and Diploma are required.");
      return;
    }
    if (!acceptLegal) {
      setErr("You must accept the Terms and Privacy Policy to create a doctor account.");
      return;
    }

    const pwdCheck = validatePassword(form.password);
    if (!pwdCheck.ok) {
      setErr(pwdCheck.message || PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (form.password.trim() !== confirmPassword.trim()) {
      setErr("Passwords do not match.");
      return;
    }

    if (!captchaToken) {
      setErr("Please complete the hCaptcha check.");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", (form.email || "").toLowerCase());
      fd.append("password", form.password);
      fd.append("phone", fullPhone || "");
      fd.append("country", form.country || "");
      fd.append("city", form.city || "");
      fd.append("gender", form.gender || "");
      fd.append("dateOfBirth", form.dateOfBirth || "");
      fd.append("hasAcceptedTerms", "true");
      fd.append("captchaToken", captchaToken);

      fd.append("idDocument", idDocument);
      fd.append("profilePhoto", idDocument);
      fd.append("diploma", diploma);
      fd.append("diplomaFile", diploma);

      const res = await fetch("/api/auth/register/doctor", { method: "POST", body: fd });
      const data = await safeParse(res);

      if (!res.ok) {
        const msg = data?.error || data?.message || res.statusText || "Signup failed";
        throw new Error(msg);
      }

      router.push("/auth/signin?accountType=doctor&registered=1");
    } catch (e: any) {
      setErr(e?.message || "Signup error");
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
        {form.password && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Password strength: {label || "Weak"}. {PASSWORD_POLICY_MESSAGE}
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthCard
      title="Create Doctor Account"
      subtitle="Tagiza for dentists: AI-supported, clinic-grade infrastructure."
    >
      <div className="space-y-4">
        {err && <div className="text-red-600 text-sm">{err}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Full name"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* Gender + DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col text-xs gap-1">
              <span className="text-slate-600 dark:text-slate-300">Gender</span>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="doctor-gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={() => setForm({ ...form, gender: "male" })}
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="doctor-gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={() => setForm({ ...form, gender: "female" })}
                  />
                  <span>Female</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="doctor-gender"
                    value="other"
                    checked={form.gender === "other"}
                    onChange={() => setForm({ ...form, gender: "other" })}
                  />
                  <span>Other</span>
                </label>
              </div>
            </div>
            <div className="flex flex-col text-xs gap-1">
              <span className="text-slate-600 dark:text-slate-300">Date of birth</span>
              <input
                type="date"
                className="w-full border p-2 rounded text-sm"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          {/* Country + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              className="w-full border p-2 rounded text-sm"
              value={form.country ? COUNTRY_OPTIONS.find((c) => c.name === form.country)?.code || "" : ""}
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
              className="w-full border p-2 rounded"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>

          {/* Phone with country code */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-600 dark:text-slate-300">Phone</span>
            <div className="flex gap-2">
              <select
                className="border p-2 rounded text-sm w-32"
                value={form.phoneCountryCode}
                onChange={(e) => setForm({ ...form, phoneCountryCode: e.target.value })}
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
                value={form.phoneLocal}
                onChange={(e) => setForm({ ...form, phoneLocal: e.target.value })}
              />
            </div>
          </div>

          {/* Password + confirm */}
          <div className="space-y-2">
            <input
              className="w-full border p-2 rounded"
              placeholder="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Confirm password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {renderStrengthBars()}
          </div>

          <div className="space-y-1 text-sm">
            <p>ID Document (image/pdf)</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-1 text-sm">
            <p>Diploma (image/pdf)</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setDiploma(e.target.files?.[0] || null)}
            />
          </div>

          <CaptchaField onTokenChange={setCaptchaToken} />

          <LegalConsentCheckbox
            role="doctor"
            checked={acceptLegal}
            onChange={setAcceptLegal}
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/signin?accountType=doctor" className="text-blue-600 underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
