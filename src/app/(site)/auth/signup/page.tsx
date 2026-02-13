// app/(site)/auth/signup/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SignupChooserPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/auth/signin";

  const go = (where: string) => router.push(where);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => go(`/auth/signup/patient?next=${encodeURIComponent(next)}`)}
          className="border rounded-xl p-6 hover:shadow text-left"
        >
          <div className="text-lg font-semibold mb-1">Patient</div>
          <p className="text-sm text-gray-600">Create a patient account</p>
        </button>
        <button
          onClick={() => go(`/auth/signup/doctor?next=${encodeURIComponent(next)}`)}
          className="border rounded-xl p-6 hover:shadow text-left"
        >
          <div className="text-lg font-semibold mb-1">Doctor</div>
          <p className="text-sm text-gray-600">Create a doctor account</p>
        </button>
        <button
          onClick={() => go(`/auth/signup/clinic?next=${encodeURIComponent(next)}`)}
          className="border rounded-xl p-6 hover:shadow text-left"
        >
          <div className="text-lg font-semibold mb-1">Clinic</div>
          <p className="text-sm text-gray-600">Register a clinic workspace</p>
        </button>
      </div>
    </div>
  );
}
