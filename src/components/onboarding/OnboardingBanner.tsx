// src/components/onboarding/OnboardingBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "patient" | "doctor" | "clinic" | undefined | null;

type OnboardingBannerProps = {
  /** Hədəf onboarding səhifəsinin URL-i, məsələn "/dashboard/doctor-self/onboarding" */
  targetHref: string;
  /** İstəyə görə: rola görə fərqli mətn göstərmək üçün */
  roleHint?: Role;
};

type State =
  | { loading: true }
  | { loading: false; show: false }
  | { loading: false; show: true; role: Role };

export function OnboardingBanner({ targetHref, roleHint }: OnboardingBannerProps) {
  const router = useRouter();
  const [state, setState] = useState<State>({ loading: true });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch("/api/account/onboarding", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setState({ loading: false, show: false });
          return;
        }
        const data = (await res.json()) as {
          authenticated?: boolean;
          hasCompletedOnboarding?: boolean;
          role?: Role;
        };

        if (cancelled) return;

        if (!data.authenticated || data.hasCompletedOnboarding) {
          setState({ loading: false, show: false });
        } else {
          setState({ loading: false, show: true, role: data.role || roleHint });
        }
      } catch {
        if (!cancelled) setState({ loading: false, show: false });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [roleHint]);

  if (state.loading || !state.show) return null;

  const role = state.role;

  let title = "Complete your profile";
  let description =
    "Finish your basic setup so you can get the full experience and keep your data safe.";
  if (role === "doctor") {
    title = "Complete your professional profile";
    description =
      "Verify your identity, add your specialization and connect to a clinic to build patient trust.";
  } else if (role === "clinic") {
    title = "Finish your clinic setup";
    description =
      "Add your clinic details and licence so your team can start using Tagiza in production.";
  } else if (role === "patient") {
    title = "Finish your patient profile";
    description =
      "Add your contact info and medical history so your doctor has everything they need.";
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <div className="font-semibold text-amber-900">{title}</div>
        <div className="text-amber-800 text-xs mt-1">{description}</div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          className="px-3 py-1.5 rounded-md border border-amber-400 bg-white text-xs font-medium text-amber-900 hover:bg-amber-100"
          onClick={() => router.push(targetHref)}
        >
          Open setup
        </button>
      </div>
    </div>
  );
}
