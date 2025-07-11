"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<"patient" | "doctor" | "clinic">("patient");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); 

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      accountType,
      redirect: false,
      callbackUrl: "/redirect",
    });

    if (res?.ok && res?.url) {
      window.location.href = res.url;
    } else {
      const urlParams = new URLSearchParams(res?.error || "");
      const errMsg = decodeURIComponent(res?.error || "");
      setErrorMsg(errMsg || "Login failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Sign In to Your Account</h2>

        <div className="flex justify-center gap-2">
          {["patient", "doctor", "clinic"].map((type) => (
            <button
              key={type}
              onClick={() => setAccountType(type as any)}
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

        {errorMsg && (
          <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-2 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Sign In as {accountType}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
  Don’t have an account?{" "}
  <Link href="/signup" className="text-blue-600 underline">
    Create one
  </Link>
</p>

<p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
  <a href="/auth/forgot-password" className="text-blue-600 underline">
    Forgot your password?
  </a>
</p>

      </div>
    </div>
  );
}
