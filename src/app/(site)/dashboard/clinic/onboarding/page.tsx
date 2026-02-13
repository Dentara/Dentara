// app/(site)/dashboard/clinic/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClinicOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") || "/dashboard/clinic";

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
      <h1 className="text-3xl font-semibold">Welcome to Tagiza for Clinics 🏥</h1>
      <p className="text-gray-600">
        We&apos;ll quickly configure your clinic workspace so your team can start using Tagiza for
        appointments, records and AI-assisted orthodontic workflows.
      </p>

      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
        <li>Complete clinic details: name, address, phone, website and logo.</li>
        <li>Upload your clinic licence and verify your organisation.</li>
        <li>Add or invite your doctors and set opening hours.</li>
      </ol>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/clinic/profile")}
          className="px-4 py-2 rounded-md bg-white border text-sm hover:bg-gray-50"
        >
          Open clinic profile
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "We’re ready to start"}
        </button>
      </div>
    </main>
  );
}
