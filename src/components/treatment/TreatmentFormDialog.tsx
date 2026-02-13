// components/treatment/TreatmentFormDialog.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToothChart from "./ToothChart";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  /** Patient.id (Clinic/Doctor konteksti) */
  patientId: string;
  clinicId?: string | null;
  doctorId?: string | null;
  onCreated?: () => void;
  triggerLabel?: string; // default: "Add Treatment"
};

type PatientFile = {
  id: string;
  title?: string | null;
  path?: string | null; // serverdə path
  url?: string | null; // serverdə url (self route-da)
  thumbnail?: string | null;
  createdAt?: string | null;
  sizeBytes?: number | null;
};

function nowLocalInput(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16); // yyyy-mm-ddThh:mm
}

export default function TreatmentFormDialog({
  patientId,
  clinicId,
  doctorId,
  onCreated,
  triggerLabel = "Add Treatment",
}: Props) {
  const [open, setOpen] = useState(false);

  // ---- form fields
  const [date, setDate] = useState<string>(nowLocalInput());
  const [category, setCategory] = useState<string>("RESTORATIVE");
  const [price, setPrice] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [teeth, setTeeth] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ---- attachments (library + upload)
  const [filesOpen, setFilesOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<PatientFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Library (LIST) — GET /api/patients/${patientId}/files  (server {files:[...]} qaytarır)
  async function loadPatientFiles() {
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/files`, {
        cache: "no-store",
      });
      const j = res.ok ? await res.json().catch(() => ({})) : {};
      // hər iki formatı dəstəklə: {files:[...]} və ya {items:[...]}
      const raw = Array.isArray(j?.files)
        ? j.files
        : Array.isArray(j?.items)
        ? j.items
        : Array.isArray(j)
        ? j
        : [];
      const items: PatientFile[] = raw.map((x: any) => ({
        id: x.id,
        title: x.title ?? x.name ?? "",
        path: x.path ?? null,
        url: x.url ?? null,
        thumbnail: x.thumbnail ?? null,
        createdAt: x.createdAt ?? null,
        sizeBytes: x.size ?? x.sizeBytes ?? null,
      }));
      setAvailableFiles(items);
    } catch {
      setAvailableFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }

  function toggleFile(fid: string) {
    setSelectedFileIds((prev) =>
      prev.includes(fid) ? prev.filter((x) => x !== fid) : [...prev, fid]
    );
  }

  function triggerUploadPicker() {
    fileInputRef.current?.click();
  }

  // Upload — POST /api/patients/${patientId}/files (multipart)
  async function handleUploadSelected(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const createdList: PatientFile[] = [];

      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", f, f.name);

        const r = await fetch(`/api/patients/${patientId}/files`, {
          method: "POST",
          body: fd,
        });

        if (!r.ok) {
          console.warn("Upload failed:", await r.text().catch(() => ""));
          continue;
        }
        const created = await r.json().catch(() => null);
        // server {file:{...}} qaytarır
        const pf: PatientFile =
          created?.file || created?.item || created || null;
        if (pf && pf.id) createdList.push(pf);
      }

      if (createdList.length === 0) {
        toast.error("Upload failed or not accepted by server.");
        return;
      }

      // merge + auto-select
      setAvailableFiles((prev) => {
        const m = new Map<string, PatientFile>();
        for (const p of prev) if (p.id) m.set(p.id, p);
        for (const p of createdList) if (p.id) m.set(p.id, p);
        return Array.from(m.values());
      });

      setSelectedFileIds((prev) =>
        Array.from(new Set([...prev, ...createdList.map((x) => x.id!)]))
      );

      toast.success(`${createdList.length} file(s) uploaded`);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  // Submit (create entry + attachmentIds + fallback link if needed)
  async function submit() {
    if (!patientId) {
      toast.error("Patient is required");
      return;
    }
    if (!date || !category || !name || teeth.length === 0) {
      toast.error(
        "Please fill required fields and select at least one tooth."
      );
      return;
    }

    setSubmitting(true);
    try {
      // 1) CREATE TreatmentEntry
      const body = {
        clinicId: clinicId ?? null,
        doctorId: doctorId ?? null,
        patientId,
        date: new Date(date).toISOString(),
        status: "DONE",
        category,
        procedureCode: code || "",
        procedureName: name,
        notes: notes || null,
        price: price ? Number(price) : null,
        teeth: teeth.map((n) => ({ numberFDI: n })),
        surfaces: [] as string[],
        attachmentIds: selectedFileIds, // create-da birləşdiririk
      };

      const r = await fetch("/api/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.text().catch(() => "");
        throw new Error(e || "Failed to create treatment.");
      }
      const created = await r.json().catch(() => ({}));
      const entryId: string | undefined =
        created?.item?.id ||
        created?.id ||
        created?.entry?.id ||
        created?.data?.id;

      // 2) Əlavə fallback linkləmə (server create attachments qaytarmayıbsa)
      const createdAttCount =
        created?.item?.attachments && Array.isArray(created.item.attachments)
          ? created.item.attachments.length
          : 0;

      if (
        entryId &&
        selectedFileIds.length > 0 &&
        createdAttCount === 0
      ) {
        await Promise.all(
          selectedFileIds.map((fid) =>
            fetch(`/api/treatments/${entryId}/attachments`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ patientFileId: fid }),
            }).catch(() => null)
          )
        );
      }

      toast.success("Treatment saved");
      setOpen(false);
      // reset
      setTeeth([]);
      setSelectedFileIds([]);
      setFilesOpen(false);
      setCode("");
      setName("");
      setNotes("");
      setPrice("");

      onCreated?.();
    } catch (err: any) {
      toast.error(err?.message || "Error while saving.");
    } finally {
      setSubmitting(false);
    }
  }

  // dialog bağlananda attachments panelini təmizlə
  useEffect(() => {
    if (!open) {
      setSelectedFileIds([]);
      setFilesOpen(false);
    }
  }, [open]);

  const canSave =
    !!patientId &&
    !!date &&
    !!category &&
    !!name &&
    teeth.length > 0 &&
    !submitting &&
    !uploading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!patientId}>{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Treatment Entry</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Date / Category / Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="mb-2 block">Date & time</Label>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXAM">Exam</SelectItem>
                  <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                  <SelectItem value="RESTORATIVE">Restorative</SelectItem>
                  <SelectItem value="ENDODONTIC">Endodontic</SelectItem>
                  <SelectItem value="PERIODONTIC">Periodontic</SelectItem>
                  <SelectItem value="PROSTHETIC">Prosthetic</SelectItem>
                  <SelectItem value="ORTHODONTIC">Orthodontic</SelectItem>
                  <SelectItem value="SURGICAL">Surgical</SelectItem>
                  <SelectItem value="IMPLANT">Implant</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Price (optional)</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 120"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Procedure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Procedure code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., D2392"
              />
            </div>
            <div>
              <Label className="mb-2 block">Procedure name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Composite filling (2 surfaces)"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="mb-2 block">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={3}
            />
          </div>

          {/* Teeth select */}
          <div>
            <Label className="mb-2 block">Select tooth/teeth</Label>
            <ToothChart multiple value={teeth} onChange={setTeeth} />
          </div>

          {/* Attachments (library + upload) */}
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                Attachments (optional)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const next = !filesOpen;
                    setFilesOpen(next);
                    if (next && availableFiles.length === 0)
                      loadPatientFiles();
                  }}
                >
                  {filesOpen ? "Hide files" : "Choose files"}
                </Button>
                <Button
                  type="button"
                  onClick={triggerUploadPicker}
                  disabled={uploading}
                >
                  {uploading ? "Uploading…" : "Upload files"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUploadSelected}
                  // accept="image/*,.pdf,.dcm"
                />
              </div>
            </div>

            {filesOpen && (
              <div className="grid gap-2">
                {loadingFiles ? (
                  <div className="text-sm text-muted-foreground">
                    Loading files…
                  </div>
                ) : availableFiles.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No files found for this patient.
                  </div>
                ) : (
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {availableFiles.map((f) => {
                      const checked = selectedFileIds.includes(f.id!);
                      const display = f.title || f.url || f.path || "";
                      return (
                        <li
                          key={f.id}
                          className={cn(
                            "flex items-center gap-3 rounded-md border p-2",
                            checked && "ring-2 ring-foreground/40"
                          )}
                        >
                          <div className="h-10 w-10 shrink-0 rounded bg-muted overflow-hidden flex items-center justify-center text-[10px]">
                            {f.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={f.thumbnail}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-muted-foreground">
                                file
                              </span>
                            )}
                          </div>
                          <div className="grow min-w-0">
                            <div className="text-sm truncate">
                              {display}
                            </div>
                            {(f.path || f.url) && (
                              <div className="text-xs text-muted-foreground truncate">
                                {f.path || f.url}
                              </div>
                            )}
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              onChange={() => toggleFile(f.id!)}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {selectedFileIds.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Selected: {selectedFileIds.length} file(s)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting || uploading}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
