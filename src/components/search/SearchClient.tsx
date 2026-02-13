"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DoctorCard from "@/components/cards/DoctorCard";
import ClinicCard from "@/components/cards/ClinicCard";
import PatientCard from "@/components/cards/PatientCard";

type HitDoctor = {
  id: string;
  fullName?: string | null;
  name?: string | null; // fallback
  email?: string | null;
  specialization?: string | null;
  clinic?: {
    id: string;
    name?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;
  ratingAvg?: number | null;
};

type HitClinic = {
  id: string;
  name?: string | null;
  city?: string | null;
  country?: string | null;
  ratingAvg?: number | null;
};

type HitPatient = {
  id: string;
  name?: string | null;
  city?: string | null;
  country?: string | null;
};

export default function SearchClient({
  initialQ = "",
  initialType = "all",
}: {
  initialQ?: string;
  initialType?: "all" | "doctor" | "clinic" | "patient";
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState<"all" | "doctor" | "clinic" | "patient">(
    (initialType as any) || "all"
  );
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<HitDoctor[]>([]);
  const [clinics, setClinics] = useState<HitClinic[]>([]);
  const [patients, setPatients] = useState<HitPatient[]>([]);

  // URL-i sinxron saxla (Next 15 searchParams Promise ilə gəlir)
  useEffect(() => {
    const want = `?type=${type}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const current = `?${sp.toString()}`;
    if (current !== want) {
      router.replace(`/search${want}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  // Sadə debounce helper
  const debounce = (fn: () => void, ms = 350) => {
    let t: any;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  };

  // Axtarış icrası
  const runSearch = useMemo(
    () =>
      debounce(async () => {
        setLoading(true);
        try {
          const resp = await fetch(
            `/api/search?type=${type}${q ? `&q=${encodeURIComponent(q)}` : ""}`
          );
          const data = await resp.json();
          setDoctors(data?.doctors || []);
          setClinics(data?.clinics || []);
          setPatients(data?.patients || []);
        } catch {
          setDoctors([]);
          setClinics([]);
          setPatients([]);
        } finally {
          setLoading(false);
        }
      }, 350),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, type]
  );

  // İlk yüklənmə və dəyişikliklərdə axtar
  useEffect(() => {
    runSearch();
  }, [runSearch]);

  return (
    <div className="space-y-4">
      {/* Tabs (All | Doctors | Clinics | Patients) */}
      <div className="inline-flex flex-wrap border rounded w-full md:w-auto">
        <button
          onClick={() => setType("all")}
          className={`px-4 py-2 whitespace-nowrap shrink-0 ${
            type === "all"
              ? "bg-gray-900 text-white"
              : "bg-white dark:bg-gray-900 dark:text-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setType("doctor")}
          className={`px-4 py-2 whitespace-nowrap shrink-0 ${
            type === "doctor"
              ? "bg-gray-900 text-white"
              : "bg-white dark:bg-gray-900 dark:text-white"
          }`}
        >
          Doctors
        </button>
        <button
          onClick={() => setType("clinic")}
          className={`px-4 py-2 whitespace-nowrap shrink-0 ${
            type === "clinic"
              ? "bg-gray-900 text-white"
              : "bg-white dark:bg-gray-900 dark:text-white"
          }`}
        >
          Clinics
        </button>
        <button
          onClick={() => setType("patient")}
          className={`px-4 py-2 whitespace-nowrap shrink-0 ${
            type === "patient"
              ? "bg-gray-900 text-white"
              : "bg-white dark:bg-gray-900 dark:text-white"
          }`}
        >
          Patients
        </button>
      </div>

      {/* Search input + actions */}
      <div className="flex gap-2 w-full min-w-0">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${
            type === "all"
              ? "doctors, clinics, or patients"
              : type === "doctor"
              ? "doctors"
              : type === "clinic"
              ? "clinics"
              : "patients"
          }…`}
          className="flex-1 min-w-0 rounded border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-900"
        />
        <button
          onClick={() => setQ("")}
          className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Clear
        </button>
        <button
          onClick={() => runSearch()}
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500">Searching…</p>}

      {/* Results */}
      {type === "all" && (
        <div className="space-y-8">
          <section>
            <h3 className="font-semibold mb-3">Clinics</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.slice(0, 6).map((c) => (
                <ClinicCard key={c.id} item={c} />
              ))}
            </div>
            {!loading && clinics.length === 0 && (
              <p className="text-gray-500">No clinics found.</p>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-3">Doctors</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.slice(0, 6).map((d) => (
                <DoctorCard key={d.id} item={d} />
              ))}
            </div>
            {!loading && doctors.length === 0 && (
              <p className="text-gray-500">No doctors found.</p>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-3">Patients</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.slice(0, 6).map((p) => (
                <PatientCard key={p.id} item={p} />
              ))}
            </div>
            {!loading && patients.length === 0 && (
              <p className="text-gray-500">No patients found.</p>
            )}
          </section>
        </div>
      )}

      {type === "doctor" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <DoctorCard key={d.id} item={d} />
          ))}
          {!loading && doctors.length === 0 && (
            <p className="text-gray-500">No doctors found.</p>
          )}
        </div>
      )}

      {type === "clinic" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinics.map((c) => (
            <ClinicCard key={c.id} item={c} />
          ))}
          {!loading && clinics.length === 0 && (
            <p className="text-gray-500">No clinics found.</p>
          )}
        </div>
      )}

      {type === "patient" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <PatientCard key={p.id} item={p} />
          ))}
          {!loading && patients.length === 0 && (
            <p className="text-gray-500">No patients found.</p>
          )}
        </div>
      )}
    </div>
  );
}
