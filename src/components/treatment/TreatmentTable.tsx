"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import TreatmentStatus from "./TreatmentStatusActions";
import TreatmentReviewDialog from "@/components/treatment/TreatmentReviewDialog";

type MiniRef = {
  id?: string;
  name?: string | null; // patient
  fullName?: string | null; // doctor
  email?: string | null;
  profilePhoto?: string | null; // doctor
};
type ToothRef = { numberFDI?: number; number?: number };

export type TreatmentEntryRow = {
  id: string;
  date: string; // ISO
  status: "PLANNED" | "DONE" | "CANCELLED";
  category?: string;
  procedureCode?: string;
  procedureName?: string;
  notes?: string | null;
  patient?: MiniRef | null;
  doctor?: MiniRef | null;
  clinic?: { id?: string; name?: string | null } | null;
  teeth?: ToothRef[];
  attachments?: any[] | null;
  /** optional: patient-specific reviews (Patient dashboard üçün) */
  reviews?: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt?: string;
  }[];
};

type Props = {
  title?: string;
  items?: TreatmentEntryRow[] | null;
  rows?: TreatmentEntryRow[] | null; // backward compat
  onDeleted?: (id: string) => void;
  allowDelete?: boolean;
  /** NEW: kart görünüşü */
  variant?: "table" | "cards";
  /** Patient panelində kartın içində review göstərmək üçün */
  showPatientReview?: boolean;
  /** Email linkindən gələndə hansı kartın “fokus” olduğunu bilmək üçün */
  reviewTargetId?: string;
  /** Pasiyent profilinə keçid üçün url (məs. `/dashboard/patients/[id]`) */
  patientProfileHref?: string;
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function catDot(c?: string) {
  switch (c) {
    case "EXAM":
    case "PREVENTIVE":
      return "bg-sky-500";
    case "RESTORATIVE":
      return "bg-blue-600";
    case "ENDODONTIC":
      return "bg-violet-600";
    case "PERIODONTIC":
      return "bg-emerald-600";
    case "PROSTHETIC":
      return "bg-amber-600";
    case "ORTHODONTIC":
      return "bg-orange-500";
    case "SURGICAL":
    case "IMPLANT":
      return "bg-rose-600";
    default:
      return "bg-slate-300";
  }
}

function isImage(path?: string | null, mime?: string | null) {
  if (!path && !mime) return false;
  if (mime && mime.startsWith("image/")) return true;
  const p = String(path || "").toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"].some((ext) =>
    p.endsWith(ext)
  );
}

export default function TreatmentTable({
  title = "Treatment History",
  items,
  rows,
  onDeleted,
  allowDelete = true,
  variant = "table",
  showPatientReview = false,
  reviewTargetId,
  patientProfileHref,
}: Props) {
  const initial = Array.isArray(rows) ? rows : Array.isArray(items) ? items : [];
  const [local, setLocal] = useState<TreatmentEntryRow[]>(initial);

  const { data: session } = useSession();
  const selfName =
    (session?.user as any)?.name ||
    (session?.user as any)?.fullname ||
    null;
  const selfEmail = session?.user?.email ?? null;

  useEffect(() => {
    if (Array.isArray(rows)) {
      setLocal(rows);
      return;
    }
    if (Array.isArray(items)) {
      setLocal(items);
    }
  }, [rows, items]);

  const mapped = useMemo(() => {
    return (local ?? []).map((x) => {
      const teethNums = (x.teeth ?? [])
        .map((t) => (typeof t.number === "number" ? t.number : t.numberFDI))
        .filter((n): n is number => typeof n === "number")
        .sort((a, b) => a - b);
      return {
        ...x,
        _date: formatDate(x.date),
        _teeth: teethNums.join(", "),
        _attCount: Array.isArray(x.attachments) ? x.attachments.length : 0,
      };
    });
  }, [local]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/treatments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Delete failed");
      }
      setLocal((prev) => prev.filter((it) => it.id !== id));
      onDeleted?.(id);
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  }

  const totalColumns = allowDelete ? 10 : 9;

  /** ================== TABLE VIEW =================== */
  if (variant === "table") {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Teeth</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Att.</TableHead>
                  {allowDelete && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {mapped.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={totalColumns}
                      className="text-center text-muted-foreground"
                    >
                      No entries
                    </TableCell>
                  </TableRow>
                ) : (
                  mapped.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">
                        {r._date}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {r._teeth || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary">
                          {r.category || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${catDot(
                              r.category
                            )}`}
                          />
                          <div className="font-weight-medium">
                            {r.procedureName || "—"}
                          </div>
                        </div>
                        {r.procedureCode ? (
                          <div className="text-xs text-muted-foreground">
                            {r.procedureCode}
                          </div>
                        ) : null}
                        {r.notes ? (
                          <div className="text-xs mt-1 text-muted-foreground">
                            {r.notes}
                          </div>
                        ) : null}
                      </TableCell>

                      {/* PATIENT CELL – effectivePatient + clickable if patientProfileHref */}
                      <TableCell className="whitespace-nowrap">
                        {(() => {
                          const effectivePatient =
                            r.patient && (r.patient.name || r.patient.email)
                              ? r.patient
                              : showPatientReview && (selfName || selfEmail)
                              ? {
                                  name: selfName || undefined,
                                  email: selfEmail || undefined,
                                }
                              : null;

                          if (!effectivePatient) return "—";

                          if (patientProfileHref) {
                            return (
                              <Link
                                href={patientProfileHref}
                                className="flex flex-col hover:underline"
                              >
                                <span>{effectivePatient.name}</span>
                                {effectivePatient.email ? (
                                  <span className="text-xs text-muted-foreground">
                                    {effectivePatient.email}
                                  </span>
                                ) : null}
                              </Link>
                            );
                          }

                          return (
                            <div className="flex flex-col">
                              <span>{effectivePatient.name}</span>
                              {effectivePatient.email ? (
                                <span className="text-xs text-muted-foreground">
                                  {effectivePatient.email}
                                </span>
                              ) : null}
                            </div>
                          );
                        })()}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {r.doctor?.profilePhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.doctor.profilePhoto}
                              alt={r.doctor?.fullName || "Doctor"}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-silver-300" />
                          )}
                          <div className="leading-tight">
                            <div className="text-sm font-medium">
                              {r.doctor?.fullName || "—"}
                            </div>
                            {r.doctor?.email ? (
                              <div className="text-xs text-muted-foreground">
                                {r.doctor.email}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {r.clinic?.name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border text-xs">
                            {r.clinic.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <TreatmentStatus
                          id={r.id}
                          value={r.status}
                          onChanged={(next) => {
                            setLocal((prev) =>
                              prev.map((it) =>
                                it.id === r.id ? { ...it, status: next } : it
                              )
                            );
                            toast.success(`Status updated to ${next}`);
                          }}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {r._attCount}
                      </TableCell>
                      {allowDelete && (
                        <TableCell className="text-right">
                          <RowActions
                            r={r}
                            onDelete={() => handleDelete(r.id)}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  /** ================== CARDS VIEW =================== */
  return (
    <div className="grid gap-3">
      {mapped.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No entries
          </CardContent>
        </Card>
      ) : (
        mapped.map((r) => (
          <Card key={r.id} className="border shadow-sm">
            <CardContent className="p-4">
              {/* üst sıra: tarix + kateqoriya + clinic chip */}
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="text-sm text-muted-foreground">{r._date}</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${catDot(
                      r.category
                    )}`}
                  />
                  <Badge variant="secondary">{r.category || "—"}</Badge>
                </div>
                {r.clinic?.name ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border text-xs">
                    {r.clinic.name}
                  </span>
                ) : null}
              </div>

              {/* orta: prosedur + kod + qeydlər */}
              <div className="mt-3">
                <div className="text-base font-medium">
                  {r.procedureName || "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.procedureCode || ""}
                </div>
                {r.notes ? <div className="text-sm mt-2">{r.notes}</div> : null}
              </div>

              {/* dişlər */}
              <div className="mt-3 text-sm">
                <span className="font-medium">Teeth: </span>
                <span>{r._teeth || "—"}</span>
              </div>

              {/* xətt */}
              <div className="my-3 h-px bg-border" />

              {/* alt sıra: patient + provider + status + attachments */}
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="text-sm">
                  <div className="text-xs text-muted-foreground">Patient</div>
                  {(() => {
                    const effectivePatient =
                      r.patient && (r.patient.name || r.patient.email)
                        ? r.patient
                        : showPatientReview && (selfName || selfEmail)
                        ? {
                            name: selfName || undefined,
                            email: selfEmail || undefined,
                          }
                        : null;

                    if (!effectivePatient) {
                      return <div className="font-medium">—</div>;
                    }

                    if (patientProfileHref) {
                      return (
                        <Link
                          href={patientProfileHref}
                          className="font-medium hover:underline flex flex-col"
                        >
                          <span>{effectivePatient.name}</span>
                          {effectivePatient.email ? (
                            <div className="text-xs text-muted-foreground">
                              {effectivePatient.email}
                            </div>
                          ) : null}
                        </Link>
                      );
                    }

                    return (
                      <div className="font-medium flex flex-col">
                        <span>{effectivePatient.name}</span>
                        {effectivePatient.email ? (
                          <div className="text-xs text-muted-foreground">
                            {effectivePatient.email}
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2">
                  {r.doctor?.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.doctor.profilePhoto}
                      alt={r.doctor?.fullName || "Doctor"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-silver-300" />
                  )}
                  <div className="leading-tight">
                    <div className="text-sm font-medium">
                      {r.doctor?.fullName || "—"}
                    </div>
                    {r.doctor?.email ? (
                      <div className="text-xs text-muted-foreground">
                        {r.doctor.email}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0">
                  <TreatmentStatus
                    id={r.id}
                    value={r.status}
                    onChanged={(next) => {
                      setLocal((prev) =>
                        prev.map((it) =>
                          it.id === r.id ? { ...it, status: next } : it
                        )
                      );
                      toast.success(`Status updated to ${next}`);
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        title="View attachments"
                        aria-label="View attachments"
                      >
                        <Paperclip className="w-4 h-4 mr-1" />
                        Files ({r._attCount})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Attachments</DialogTitle>
                      </DialogHeader>
                      {Array.isArray(r.attachments) &&
                      r.attachments.length > 0 ? (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {r.attachments.map((a: any) => {
                            const f = a?.patientFile || a;
                            const label =
                              f?.title ||
                              (f?.path
                                ? String(f.path).split("/").pop()
                                : f?.id) ||
                              "File";
                            const href = f?.path || f?.url || null;
                            const thumb =
                              f?.thumbnail ||
                              (isImage(f?.path, f?.mime) ? href : null);
                            return (
                              <li
                                key={a?.id || f?.id}
                                className="rounded border p-2 flex items-center gap-3"
                              >
                                <div className="h-12 w-12 rounded bg-muted overflow-hidden flex items-center justify-center">
                                  {thumb ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={thumb}
                                      alt={label}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <Paperclip className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm truncate">
                                    {label}
                                  </div>
                                  {href ? (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {href}
                                    </div>
                                  ) : null}
                                </div>
                                {href ? (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="text-sm underline shrink-0"
                                    title="Open"
                                  >
                                    Open
                                  </a>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No attachments
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  {allowDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(r.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* ⭐ Review panel (yalnız patient panelində aktiv) */}
              {showPatientReview && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex flex-wrap items-start justify-between gap-3">
                  {/* soldakı məlumat bloku */}
                  <div className="text-xs text-amber-900 space-y-1 flex-1 min-w-0">
                    <div className="font-medium flex items-center gap-2">
                      <span>Your rating</span>
                      <span className="text-sm font-semibold text-amber-500">
                        {(() => {
                          const r0 = Number(
                            ((r as any).reviews?.[0]?.rating ?? 0)
                          );
                          return (
                            "★★★★★".slice(0, r0) +
                            "☆☆☆☆☆".slice(0, 5 - r0)
                          );
                        })()}
                      </span>
                    </div>
                    {(r as any).reviews?.[0]?.comment ? (
                      <div className="line-clamp-2 italic">
                        “{(r as any).reviews?.[0]?.comment}”
                      </div>
                    ) : (
                      <div>Share your experience for this treatment.</div>
                    )}
                  </div>

                  {/* düymə */}
                  <div className="shrink-0">
                    <TreatmentReviewDialog
                      treatmentId={r.id}
                      triggerLabel={
                        (r as any).reviews?.[0]
                          ? "Edit review"
                          : reviewTargetId === r.id
                          ? "Write review for this treatment"
                          : "Write review"
                      }
                      onSaved={(saved) => {
                        setLocal((prev) =>
                          prev.map((it) =>
                            it.id === r.id
                              ? {
                                  ...it,
                                  reviews: [
                                    {
                                      ...(Array.isArray(
                                        (it as any).reviews
                                      ) && (it as any).reviews.length > 0
                                        ? (it as any).reviews[0]
                                        : {}),
                                      rating: saved.rating,
                                      comment: saved.comment ?? null,
                                    },
                                  ],
                                }
                              : it
                          )
                        );
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/** Reusable row actions for table view */
function RowActions({
  r,
  onDelete,
}: {
  r: TreatmentEntryRow & { _attCount?: number };
  onDelete: () => void;
}) {
  return (
    <div className="inline-flex items-center justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            title="View attachments"
            aria-label="View attachments"
          >
            <Paperclip className="w-4 h-4 mr-1" />
            Files
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
          </DialogHeader>
          {Array.isArray(r.attachments) && r.attachments.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {r.attachments.map((a: any) => {
                const f = a?.patientFile || a;
                const label =
                  f?.title ||
                  (f?.path ? String(f.path).split("/").pop() : f?.id) ||
                  "File";
                const href = f?.path || f?.url || null;
                const thumb =
                  f?.thumbnail ||
                  (isImage(f?.path, f?.mime) ? href : null);
                return (
                  <li
                    key={a?.id || f?.id}
                    className="rounded border p-2 flex items-center gap-3"
                  >
                    <div className="h-12 w-12 rounded bg-muted overflow-hidden flex items-center justify-center">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={label}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{label}</div>
                      {href ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {href}
                        </div>
                      ) : null}
                    </div>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="text-sm underline shrink-0"
                        title="Open"
                      >
                        Open
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">
              No attachments
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        aria-label="Delete"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
