'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("✅ Your email has been successfully verified.");
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "❌ Invalid or expired verification link.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("❌ An error occurred while verifying your email.");
      }
    };

    if (token) {
      verify();
    } else {
      setStatus("error");
      setMessage("❌ Missing verification token.");
    }
  }, [token]);

  return (
    <>
      <Head>
        <title>Verify Email | Dentara</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
          <p
            className={`text-sm leading-relaxed ${
              status === "success"
                ? "text-green-600"
                : status === "error"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {message}
          </p>

          {status === "success" && (
            <p className="text-xs text-gray-500 mt-4">Redirecting to login page...</p>
          )}
        </div>
      </div>
    </>
  );
}
