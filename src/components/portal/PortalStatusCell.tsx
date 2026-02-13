// components/portal/PortalStatusCell.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalStatusBadge } from "@/components/portal/PortalStatusBadge";

type PortalType = "doctor" | "patient";
type Status = "linked" | "pending" | "none";

type FetchState = {
  loaded: boolean;
  map: Record<string, Status>; // key: id (Doctor.id | ClinicPatient.id)
};

const cache: Record<PortalType, FetchState> = {
  doctor: { loaded: false, map: {} },
  patient: { loaded: false, map: {} },
};

async function fetchStatusesOnce(t: PortalType): Promise<FetchState> {
  if (cache[t].loaded) return cache[t];
  const url =
    t === "doctor"
      ? "/api/clinic/portal/doctors"
      : "/api/clinic/portal/patients";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("status fetch failed");
    const data = await res.json();
    const map: Record<string, Status> = {};
    (data?.items ?? []).forEach((it: any) => {
      map[String(it.id)] = (it.portalStatus ?? "none") as Status;
    });
    cache[t] = { loaded: true, map };
    return cache[t];
  } catch {
    return { loaded: true, map: {} };
  }
}

export function PortalStatusCell({
  type,
  id,
}: {
  type: PortalType;
  id: string;
}) {
  const [state, setState] = useState<FetchState>(() => cache[type]);

  useEffect(() => {
    if (!state.loaded) {
      fetchStatusesOnce(type).then(setState);
    }
  }, [type, state.loaded]);

  const status = useMemo<Status>(() => {
    return (state.map?.[String(id)] as Status) || "none";
  }, [state.map, id]);

  return <PortalStatusBadge status={status} />;
}
