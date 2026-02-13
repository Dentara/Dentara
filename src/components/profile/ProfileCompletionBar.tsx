// components/profile/ProfileCompletionBar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "patient" | "doctor" | "clinic" | string | null;

type Item = {
  key: string;
  label: string;
  filled: boolean;
};

type State =
  | { loading: true }
  | { loading: false; error: string }
  | {
      loading: false;
      error?: string;
      role: Role;
      score: number;
      items: Item[];
      missing: Item[];
    };

export default function ProfileCompletionBar() {
  const [state, setState] = useState<State>({ loading: true });
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/account/profile-completeness", {
          cache: "no-store",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!cancelled) {
            setState({
              loading: false,
              error: data?.error || "Could not load profile completeness.",
            });
          }
          return;
        }
        const data = (await res.json()) as {
          role: Role;
          score: number;
          items: Item[];
          missingCount: number;
        };
        if (cancelled) return;

        const missing = (data.items || []).filter((i) => !i.filled);
        setState({
          loading: false,
          role: data.role,
          score: data.score,
          items: data.items,
          missing,
        });
      } catch (e: any) {
        if (!cancelled) {
          setState({
            loading: false,
            error: e?.message || "Could not load profile completeness.",
          });
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 animate-pulse">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-10 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  if ("error" in state && state.error) {
    // Sakit failure — heç nə göstərmirik
    return null;
  }

  const { score, missing, role } = state as Exclude<State, { loading: true }>;

  // 100% tamamdırsa, göstərməmək olar (və ya çox kiçik)
  if (score >= 99) {
    return (
      <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-xs flex items-center justify-between">
        <span className="font-medium text-emerald-900 dark:text-emerald-100">
          Profile completeness: {score}%
        </span>
        <span className="text-emerald-800 dark:text-emerald-200">
          Your {role} profile is fully configured.
        </span>
      </div>
    );
  }

  const topMissing = missing.slice(0, 3);

  const goToProfile = () => {
    if (role === "clinic") router.push("/dashboard/clinic/profile");
    else if (role === "doctor") router.push("/dashboard/doctor-self/profile");
    else router.push("/dashboard/patient-self/profile");
  };

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 md:px-5 md:py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            Profile completeness
          </div>
          <div className="text-sm font-semibold text-amber-900 dark:text-amber-50">
            {score}% completed
          </div>
        </div>
        <button
          type="button"
          onClick={goToProfile}
          className="px-3 py-1.5 rounded-full bg-amber-900 text-xs text-amber-50 hover:bg-amber-800"
        >
          Complete profile
        </button>
      </div>

      <div className="h-2 rounded-full bg-amber-100 dark:bg-amber-900 overflow-hidden">
        <div
          className="h-2 rounded-full bg-amber-500 dark:bg-amber-400 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {topMissing.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-xs text-amber-900 dark:text-amber-100">
            To reach 100%, complete:
          </div>
          <ul className="text-xs text-amber-900 dark:text-amber-50 list-disc ml-5 md:ml-0 md:list-none flex flex-wrap gap-2">
            {topMissing.map((item) => (
              <li key={item.key} className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-700 dark:bg-amber-300" />
                <span>{item.label}</span>
              </li>
            ))}
            {missing.length > topMissing.length && (
              <li className="opacity-70">+ {missing.length - topMissing.length} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
