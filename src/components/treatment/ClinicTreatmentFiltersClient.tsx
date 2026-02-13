"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TreatmentFormDialog from "./TreatmentFormDialog";

type Patient = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
};

type Doctor = {
  id: string;
  fullName?: string | null;
  email?: string | null;
};

function pickArray<T = any>(j: any, keys: string[] = []): T[] {
  if (Array.isArray(j)) return j as T[];
  for (const k of keys) {
    const v = j?.[k];
    if (Array.isArray(v)) return v as T[];
  }
  return [];
}

export default function ClinicTreatmentFiltersClient(props: {
  mode?: "history" | "add";
  fixedPatientId?: string;
  fixedDoctorId?: string;
  successRedirectBase?: string;
  contextRole?: "clinic" | "doctor" | "patient";
  initialPatientId?: string;
  initialDoctorId?: string;
  initialCategory?: string;
  initialStatus?: string;
  initialFrom?: string;
  initialTo?: string;
}) {
  const {
    mode = "history",
    fixedPatientId,
    fixedDoctorId,
    successRedirectBase,
    contextRole = "clinic",
    initialPatientId = "",
    initialDoctorId = "",
    initialCategory = "",
    initialStatus = "",
    initialFrom = "",
    initialTo = "",
  } = props;

  // -------- Patient picker ----------
  const [patientId, setPatientId] = useState(fixedPatientId || initialPatientId);
  const [patientLabel, setPatientLabel] = useState("");
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);

  // -------- Doctor select -----------
  const [doctorId, setDoctorId] = useState(fixedDoctorId || initialDoctorId);
  const [doctorOpts, setDoctorOpts] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // -------- History-only filters ----
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  // Doctor listini yüklə (yalnız picker görünəcəksə)
  useEffect(() => {
    if (fixedDoctorId) {
      setLoadingDoctors(false);
      return;
    }
    let alive = true;
    (async () => {
      setLoadingDoctors(true);
      try {
        const res = await fetch(`/api/doctors`, { cache: "no-store" });
        const j = res.ok ? await res.json().catch(() => []) : [];
        const items = pickArray<Doctor>(j, ["items", "doctors"]);
        if (alive) setDoctorOpts(items.slice(0, 300));
      } catch {
        if (alive) setDoctorOpts([]);
      } finally {
        if (alive) setLoadingDoctors(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fixedDoctorId]);

  // Detail base (clinic vs doctor)
  function detailBase() {
    return (
      successRedirectBase ||
      (contextRole === "doctor"
        ? "/dashboard/doctor-self/patient-treatments"
        : "/dashboard/clinic/patient-treatments")
    );
  }

  // History URL
  function historyBaseUrl() {
    if (fixedPatientId || patientId)
      return `${detailBase()}/${fixedPatientId || patientId}`;
    return detailBase();
  }

  function submitGET() {
    const qs = new URLSearchParams();
    const effDoctorId = fixedDoctorId || doctorId;
    if (effDoctorId) qs.set("doctorId", effDoctorId);
    if (mode === "history") {
      if (category) qs.set("category", category);
      if (status) qs.set("status", status);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
    }
    const base =
      mode === "history" ? historyBaseUrl() : "/dashboard/clinic/treatments";
    const url = qs.toString() ? `${base}?${qs.toString()}` : base;
    window.location.href = url;
  }

  function reset() {
    const base =
      mode === "history" ? historyBaseUrl() : "/dashboard/clinic/treatments";
    window.location.href = base;
  }

  // ADD rejimində create-dən sonra seçilmiş patient-in detal səhifəsinə keç
  function onCreatedRedirect() {
    const pid = patientId || fixedPatientId;
    if (!pid) return;
    window.location.href = `${detailBase()}/${pid}`;
  }

  const showPatientPicker = mode === "add" && !fixedPatientId;
  const showDoctorPicker =
    !fixedDoctorId && (mode === "history" || mode === "add");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
      {/* Patient picker yalnız "add" rejimində və fixedPatientId olmadıqda görünür */}
      {showPatientPicker && (
        <div className="lg:col-span-2 relative">
          <button
            type="button"
            onClick={() => setPatientPickerOpen((v) => !v)}
            className="h-10 w-full rounded-md border px-3 text-left text-sm bg-background"
            aria-haspopup="listbox"
            aria-expanded={patientPickerOpen}
            title={patientLabel || "Select patient"}
          >
            {patientLabel || "Select patient"}
          </button>

          {patientPickerOpen && (
            <div className="absolute left-0 right-0 z-30">
              <PatientCombobox
                onClose={() => setPatientPickerOpen(false)}
                onSelect={(p) => {
                  setPatientId(p.id);
                  setPatientLabel(
                    `${p.name || "Unnamed"} (${p.email || p.phone || "—"})`
                  );
                  setPatientPickerOpen(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Doctor */}
      {showDoctorPicker ? (
        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          className="h-10 rounded-md border px-3"
        >
          <option value="">
            {loadingDoctors ? "Loading doctors…" : "Doctor: All"}
          </option>
          {doctorOpts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName || "Unnamed"} {d.email ? `(${d.email})` : ""}
            </option>
          ))}
        </select>
      ) : (
        // fixedDoctorId varsa, layout-u qorumaq üçün disabled select göstəririk
        <select
          value={fixedDoctorId || ""}
          className="h-10 rounded-md border px-3"
          disabled
        >
          <option value={fixedDoctorId || ""}>Doctor: Fixed</option>
        </select>
      )}

      {/* History-only fields */}
      {mode === "history" ? (
        <>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border px-3"
          >
            <option value="">Category: All</option>
            <option value="EXAM">Exam</option>
            <option value="PREVENTIVE">Preventive</option>
            <option value="RESTORATIVE">Restorative</option>
            <option value="ENDODONTIC">Endodontic</option>
            <option value="PERIODONTIC">Periodontic</option>
            <option value="PROSTHETIC">Prosthetic</option>
            <option value="ORTHODONTIC">Orthodontic</option>
            <option value="SURGICAL">Surgical</option>
            <option value="IMPLANT">Implant</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-md border px-3"
          >
            <option value="">Status: All</option>
            <option value="PLANNED">Planned</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="grid grid-cols-2 gap-3 lg:col-span-3">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          {/* ADD-only boşluq doldurma */}
          <div className="lg:col-span-3" />
          <div />
        </>
      )}

      {/* Actions */}
      <div className="lg:col-span-3 flex flex-wrap items-center gap-2">
        {mode === "history" ? (
          <>
            <Button type="button" onClick={submitGET}>
              Filter
            </Button>
            <Button variant="outline" type="button" onClick={reset}>
              Reset
            </Button>
          </>
        ) : (
          <div className="ml-auto">
            {patientId || fixedPatientId ? (
              <TreatmentFormDialog
                patientId={(patientId || fixedPatientId)!}
                clinicId={null}
                doctorId={fixedDoctorId || doctorId || null}
                onCreated={onCreatedRedirect}
              />
            ) : (
              <Button
                type="button"
                disabled
                title="Select a patient to add treatment"
              >
                Add Treatment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========= PatientCombobox — yalnız /api/patients (clinic üçün merge hazırdır) ========= */
function PatientCombobox({
  onSelect,
  onClose,
}: {
  onSelect: (p: Patient) => void;
  onClose: () => void;
}) {
  const [list, setList] = useState<Patient[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [emptyHint, setEmptyHint] = useState<"initial" | "searched">("initial");
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debRef = useRef<any>(null);
  const lastReqIdRef = useRef<string>("");

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const el = boxRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  // initial load — yalnız /api/patients (clinic user üçün ClinicPatient + Patient merge)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setEmptyHint("initial");
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch(`/api/patients`, {
          cache: "no-store",
          signal: ac.signal,
        }).catch(() => null);
        const j = res && res.ok ? await res.json().catch(() => []) : [];
        const base = pickArray<Patient>(j, ["patients"]);
        if (mounted) {
          setList(base.slice(0, 50));
        }
      } catch {
        if (mounted) setList([]);
      } finally {
        if (mounted) {
          setLoading(false);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
    })();
    return () => {
      mounted = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [onClose]);

  // search – yalnız /api/patients?q=...
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    const t = term.trim();
    if (t.length < 2) {
      setEmptyHint("initial");
      return;
    }
    debRef.current = setTimeout(async () => {
      const reqId =
        Date.now().toString() + "_" + Math.random().toString(36).slice(2);
      lastReqIdRef.current = reqId;

      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/patients?q=${encodeURIComponent(t)}`,
          { cache: "no-store", signal: ac.signal }
        ).catch(() => null);
        if (!res) {
          setEmptyHint("searched");
          setList([]);
          setLoading(false);
          return;
        }
        if (lastReqIdRef.current !== reqId) return;

        const j = res.ok ? await res.json().catch(() => []) : [];
        const base = pickArray<Patient>(j, ["patients"]);

        setEmptyHint("searched");
        setList(base.slice(0, 50));
      } catch {
        if (lastReqIdRef.current !== reqId) return;
        setEmptyHint("searched");
        setList([]);
      } finally {
        if (lastReqIdRef.current === reqId) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debRef.current);
  }, [term]);

  async function loadRecentClinic() {
    setLoading(true);
    setEmptyHint("initial");
    try {
      const res = await fetch(`/api/patients`, {
        cache: "no-store",
      }).catch(() => null);
      const j = res && res.ok ? await res.json().catch(() => []) : [];
      const base = pickArray<Patient>(j, ["patients"]);
      setList(base.slice(0, 10));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div
      ref={boxRef}
      className="border bg-background rounded-md shadow-sm"
    >
      <div className="p-2 border-b flex gap-2">
        <Input
          ref={inputRef}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search patients…"
        />
        <Button variant="outline" type="button" onClick={loadRecentClinic}>
          Recent
        </Button>
        <Button variant="ghost" type="button" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="max-h-72 overflow-auto">
        {loading ? (
          <div className="p-3 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : list.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            {emptyHint === "initial"
              ? "Type at least 2 characters…"
              : "No results"}
          </div>
        ) : (
          <ul role="listbox" className="divide-y">
            {list.map((p) => (
              <li
                key={p.id}
                role="option"
                className="p-2 hover:bg-muted cursor-pointer"
                onClick={() => onSelect(p)}
              >
                <div className="text-sm">{p.name || "Unnamed"}</div>
                <div className="text-xs text-muted-foreground">
                  {p.email || p.phone || "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
