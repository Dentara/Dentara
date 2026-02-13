// src/components/auth/SignInForm.tsx
"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "./AuthCard";

type AccountType = "patient" | "doctor" | "clinic";

export function SignInForm() {
  const sp = useSearchParams();

  const [accountType, setAccountType] = useState<AccountType>(
    (sp.get("accountType") as AccountType) || "patient"
  );
  const [formData, setFormData] = useState({ email: "", password: "" });

  const banner = useMemo(() => {
    if (sp.get("verified") === "1") {
      return {
        color: "bg-green-50 border-green-200 text-green-700",
        text: "Your email has been verified. You can sign in now.",
      };
    }
    if (sp.get("registered") === "1") {
      return {
        color: "bg-blue-50 border-blue-200 text-blue-700",
        text: "Account created. Please check your email and verify your address.",
      };
    }
    if (sp.get("resend") === "1") {
      return {
        color: "bg-blue-50 border-blue-200 text-blue-700",
        text: "Verification email re-sent. Please check your inbox.",
      };
    }
    return null;
  }, [sp]);

  const errorParam = sp.get("error") || "";
  const [errorMsg, setErrorMsg] = useState<string>(
    errorParam === "verify_required"
      ? "Please verify your email before logging in."
      : decodeURIComponent(errorParam || "")
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const callbackAbs =
      typeof window !== "undefined" ? `${window.location.origin}/redirect` : "/redirect";

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      accountType,
      redirect: false,
      callbackUrl: callbackAbs,
    });

    if (res?.ok && res?.url) {
      try {
        await fetch("/api/auth/post-register-linker", { method: "POST" });
      } catch {
        // ignore – auth flow pozulmasın
      }
      window.location.href = res.url;
    } else {
      const msg = decodeURIComponent(res?.error || "Login failed.");
      setErrorMsg(msg);
    }
  };

  const signupChooserHref = `/auth/signup?next=${encodeURIComponent(
    `/auth/signin?accountType=${accountType}`
  )}`;

  const resendHref = `/api/auth/resend?email=${encodeURIComponent(formData.email || "")}`;

  return (
    <AuthCard title="Sign In to Your Account">
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {(["patient", "doctor", "clinic"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAccountType(type)}
              className={`px-4 py-1 rounded border text-sm capitalize ${
                accountType === type
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {banner && (
          <div className={`${banner.color} text-sm text-center border p-2 rounded`}>
            {banner.text}
          </div>
        )}

        {errorMsg && (
          <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-2 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            Sign In as {accountType}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          By signing in, you agree to Tagiza&apos;s{" "}
          <Link href="/legal/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
          Don’t have an account?{" "}
          <Link href={signupChooserHref} className="text-blue-600 underline">
            Create one
          </Link>
        </p>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
          <a href={resendHref} className="text-blue-600 underline">
            Resend verification email
          </a>
        </p>
      </div>
    </AuthCard>
  );
}
