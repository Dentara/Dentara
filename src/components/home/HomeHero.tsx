// components/home/HomeHero.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  role?: "clinic" | "doctor" | "patient";
  isAuthenticated: boolean;
};

type Scope = "local" | "country" | "global";

export default function HomeHero({ role, isAuthenticated }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [scope, setScope] = useState<Scope>("global");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", "all");
    const query = q.trim();
    if (query) params.set("q", query);
    if (country.trim()) params.set("country", country.trim());
    if (city.trim()) params.set("city", city.trim());
    params.set("scope", scope);

    router.push(`/search?${params.toString()}`);
  };

  const QuickActions = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/auth/signin"
            className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Explore
          </Link>
          <Link
            href="/whitepaper"
            className="px-5 py-2.5 rounded border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Whitepaper
          </Link>
        </div>
      );
    }
    if (role === "clinic") {
      return (
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/clinic/treatments"
            className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Treatment
          </Link>
          <Link
            href="/dashboard/clinic/patient-treatments"
            className="px-5 py-2.5 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Patient History
          </Link>
          <Link
            href="/dashboard/clinic/profile"
            className="px-5 py-2.5 rounded border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Clinic Profile
          </Link>
        </div>
      );
    }
    if (role === "doctor") {
      return (
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/doctor-self/treatments"
            className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Treatment
          </Link>
          <Link
            href="/dashboard/doctor-self/patient-treatments"
            className="px-5 py-2.5 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Patient History
          </Link>
          <Link
            href="/dashboard/doctor-self/patients"
            className="px-5 py-2.5 rounded border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            My Patients
          </Link>
        </div>
      );
    }
    // patient
    return (
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/patient-self/treatments"
          className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          My Treatments
        </Link>
        <Link
          href="/search?type=doctor"
          className="px-5 py-2.5 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Find a Doctor
        </Link>
        <Link
          href="/dashboard/patient-self/files"
          className="px-5 py-2.5 rounded border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          My Files
        </Link>
      </div>
    );
  };

  const ScopeChip = ({
    value,
    label,
    description,
  }: {
    value: Scope;
    label: string;
    description: string;
  }) => {
    const active = scope === value;
    return (
      <button
        type="button"
        onClick={() => setScope(value)}
        className={[
          "px-3 py-2 rounded-full text-xs md:text-sm border flex flex-col items-start min-w-[120px]",
          active
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700",
        ].join(" ")}
      >
        <span className="font-semibold">{label}</span>
        <span className="text-[10px] md:text-[11px] opacity-80 text-left">
          {description}
        </span>
      </button>
    );
  };

  return (
    <section className="text-center px-4 py-24 max-w-4xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-800 dark:text-white leading-tight">
        Blockchain Meets Dentistry
      </h1>
      <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
        Tagiza is the Web3 dental network — verified credentials, secure records, and a
        global directory for clinics, doctors, and patients.
      </p>

      {/* Universal Search + Region */}
      <form
        onSubmit={onSearch}
        className="max-w-2xl mx-auto flex flex-col gap-3 mb-6"
      >
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search doctors, clinics, or posts…"
            className="flex-1 rounded border border-gray-300 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900"
          >
            Search
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country (e.g. Azerbaijan)"
            className="flex-1 rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Baku)"
            className="flex-1 rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <ScopeChip
            value="local"
            label="Nearby"
            description="Match country and city"
          />
          <ScopeChip
            value="country"
            label="My country"
            description="Match country only"
          />
          <ScopeChip
            value="global"
            label="Global"
            description="Search worldwide"
          />
        </div>
      </form>

      <QuickActions />
    </section>
  );
}
