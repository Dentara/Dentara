// app/(site)/(self)/dashboard/patient-self/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PatientOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") || "/dashboard/patient-self";

  const handleComplete = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/account/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update onboarding status");
      }
      router.push(next);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold">Welcome to Tagiza ✨</h1>
      <p className="text-gray-600">
        To get the best experience as a patient, please review these quick steps. It takes less
        than a minute and helps your doctors work safely with your data.
      </p>

      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
        <li>Complete your basic details (name, phone, country, city) in your profile.</li>
        <li>Optionally add your medical history and allergies in the medical information section.</li>
        <li>Upload any important X-rays or previous reports to your Files tab.</li>
      </ol>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/patient-self/profile")}
          className="px-4 py-2 rounded-md bg-white border text-sm hover:bg-gray-50"
        >
          Open my profile
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "I’ve completed my setup"}
        </button>
      </div>
    </main>
  );
}
