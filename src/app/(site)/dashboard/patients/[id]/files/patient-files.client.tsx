// app/(site)/dashboard/patients/[id]/files/patient-files.client.tsx
"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Download,
  Trash2,
  RefreshCw,
  UploadCloud,
  Plus,
  Pencil,
  FolderOpen,
} from "lucide-react";

type Visibility = "PRIVATE" | "PUBLIC";
type ScopeKey = "xrays" | "attachments" | "face" | "teeth" | "billing";

type FileItem = {
  id: string;             // NEW: serverdən gəlir (assign üçün lazımdır)
  name: string;
  url: string;
  createdAt: string;
  size?: number | null;
  visibility?: Visibility;
  mime?: string | null;
  albumId?: string | null;
};
type AlbumItem = {
  id: string;
  title: string;
  scope: string;
  createdAt: string;
};

type Props = {
  patientId: string;
  uploadsEnabled?: boolean;
};

const SCOPES: { key: ScopeKey; label: string }[] = [
  { key: "xrays",       label: "X-Rays" },
  { key: "face",        label: "Face" },
  { key: "teeth",       label: "Teeth" },
  { key: "attachments", label: "Attachments" },
  { key: "billing",     label: "Billing" },
];

// ---------- helpers ----------
function extOf(nameOrUrl: string) {
  const m = nameOrUrl.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return (m?.[1] || "").toLowerCase();
}
function isImageByNameOrMime(f: Pick<FileItem, "name" | "url" | "mime">) {
  const e = extOf(f.url || f.name);
  if (/(jpe?g|png|gif|webp|bmp|tiff)$/i.test(e)) return true;
  if (f.mime && /^image\//i.test(f.mime)) return true;
  return false;
}
function isPdf(f: Pick<FileItem, "name" | "mime" | "url">) {
  const e = extOf(f.url || f.name);
  if (f.mime && /pdf$/i.test(f.mime)) return true;
  return e === "pdf";
}
function prettyDate(d: string | number | Date) {
  const dt = new Date(d);
  return dt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function groupByDate(items: FileItem[]) {
  const map = new Map<string, FileItem[]>();
  for (const it of items) {
    const key = new Date(it.createdAt).toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default function PatientFilesClient({
  patientId,
  uploadsEnabled = false,
}: Props) {
  const [active, setActive] = useState<ScopeKey>("xrays");
  const [items, setItems] = useState<FileItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [renamingAlbumId, setRenamingAlbumId] = useState<string | null>(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");

  const [version, setVersion] = useState(0); // files refresh
  const [albumsVersion, setAlbumsVersion] = useState(0); // albums refresh

  const baseUrl = useMemo(() => `/api/patients/${patientId}/files`, [patientId]);
  const albumsUrl = useMemo(() => `/api/patients/${patientId}/files/albums`, [patientId]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const qs = new URLSearchParams({ scope: active });
      if (selectedAlbumId) qs.set("albumId", selectedAlbumId);
      const res = await fetch(`${baseUrl}?${qs.toString()}`, { cache: "no-store" });
      if (res.status === 403) {
        setForbidden(true);
        setItems([]);
      } else if (!res.ok) {
        console.error("Files GET failed", await res.text());
        setItems([]);
      } else {
        const data = await res.json();
        const list: FileItem[] = Array.isArray(data?.files ?? data)
          ? (data.files ?? data)
          : [];
        setItems(list);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, active, selectedAlbumId]);

  const loadAlbums = useCallback(async () => {
    setAlbumsLoading(true);
    try {
      const res = await fetch(`${albumsUrl}`, { cache: "no-store" });
      if (!res.ok) {
        console.error("Albums GET failed", await res.text());
        setAlbums([]);
      } else {
        const data = await res.json();
        const list: AlbumItem[] = Array.isArray(data?.albums ?? data)
          ? (data.albums ?? data)
          : [];
        setAlbums(list.filter((a) => a.scope === active));
        if (selectedAlbumId && !list.some((x) => x.id === selectedAlbumId)) {
          setSelectedAlbumId(null);
        }
      }
    } catch (e) {
      console.error(e);
      setAlbums([]);
    } finally {
      setAlbumsLoading(false);
    }
  }, [albumsUrl, active, selectedAlbumId]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums, albumsVersion, active]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles, version]);

  // Tab (scope) dəyişəndə albom filtrini sıfırla
  useEffect(() => {
    setSelectedAlbumId(null);
  }, [active]);

  const onRefresh = () => setVersion((v) => v + 1);
  const onAlbumsRefresh = () => setAlbumsVersion((v) => v + 1);

  const onDelete = async (name: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const url = `${baseUrl}?name=${encodeURIComponent(name)}&scope=${active}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        console.error("Delete failed", await res.text());
        alert("Delete failed");
        return;
      }
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("scope", active);
      const qs = new URLSearchParams({ scope: active });
      if (selectedAlbumId) qs.set("albumId", selectedAlbumId);
      const res = await fetch(`${baseUrl}/upload?${qs.toString()}`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        console.error("Upload failed", await res.text());
        alert("Upload failed");
        return;
      }
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onCreateAlbum = async () => {
    const title = newAlbumTitle.trim();
    if (!title) return;
    try {
      const res = await fetch(albumsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, scope: active }),
      });
      if (!res.ok) {
        console.error("Create album failed", await res.text());
        alert("Create album failed");
        return;
      }
      const data = await res.json();
      const createdId = data?.album?.id as string | undefined;

      setNewAlbumTitle("");
      setCreatingAlbum(false);
      onAlbumsRefresh();
      if (createdId) setSelectedAlbumId(createdId);
    } catch (e) {
      console.error(e);
      alert("Create album failed");
    }
  };

  const onRenameAlbum = async (albumId: string, title: string) => {
    try {
      const res = await fetch(`${albumsUrl}/${albumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    if (!res.ok) {
        console.error("Rename failed", await res.text());
        alert("Rename failed");
        return;
      }
      setRenamingAlbumId(null);
      onAlbumsRefresh();
    } catch (e) {
      console.error(e);
      alert("Rename failed");
    }
  };

  const onDeleteAlbum = async (albumId: string) => {
    if (!confirm("Delete this album? Files will be kept but unassigned.")) return;
    try {
      const res = await fetch(`${albumsUrl}/${albumId}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("Delete album failed", await res.text());
        alert("Delete album failed");
        return;
      }
      if (selectedAlbumId === albumId) setSelectedAlbumId(null);
      onAlbumsRefresh();
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Delete album failed");
    }
  };

  // Faylı alboma köçür (assign)
  const assignToAlbum = async (fileId: string, albumId: string | null) => {
    try {
      const res = await fetch(baseUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, albumId }),
      });
      if (!res.ok) {
        console.error("Assign failed", await res.text());
        alert("Move to album failed");
        return;
      }
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Move to album failed");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={active} onValueChange={(v) => setActive(v as ScopeKey)} className="w-full">
        <TabsList className="flex flex-wrap">
          {SCOPES.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="capitalize">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Albom bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedAlbumId ? "outline" : "default"}
            size="sm"
            onClick={() => setSelectedAlbumId(null)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            All {SCOPES.find((x) => x.key === active)?.label}
          </Button>

          {albumsLoading ? (
            <span className="text-xs text-muted-foreground">Loading albums…</span>
          ) : albums.length === 0 ? (
            <span className="text-xs text-muted-foreground">No albums yet.</span>
          ) : (
            albums.map((a) =>
              renamingAlbumId === a.id ? (
                <div key={a.id} className="flex items-center gap-1">
                  <Input
                    defaultValue={a.title}
                    autoFocus
                    className="h-8 w-40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onRenameAlbum(a.id, (e.target as HTMLInputElement).value);
                      if (e.key === "Escape") setRenamingAlbumId(null);
                    }}
                    onBlur={(e) => onRenameAlbum(a.id, e.target.value)}
                  />
                </div>
              ) : (
                <Button
                  key={a.id}
                  variant={selectedAlbumId === a.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedAlbumId(a.id)}
                  className="flex items-center gap-2"
                  title={`${a.title} — ${prettyDate(a.createdAt)}`}
                >
                  {a.title}
                  <Pencil
                    className="h-3.5 w-3.5 opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingAlbumId(a.id);
                    }}
                  />
                </Button>
              )
            )
          )}

          {uploadsEnabled && (
            <>
              {!creatingAlbum ? (
                <Button variant="outline" size="sm" onClick={() => setCreatingAlbum(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New album
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Album title"
                    className="h-8 w-44"
                    value={newAlbumTitle}
                    onChange={(e) => setNewAlbumTitle(e.target.value)}
                  />
                  <Button size="sm" onClick={onCreateAlbum}>Create</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setCreatingAlbum(false); setNewAlbumTitle(""); }}>
                    Cancel
                  </Button>
                </div>
              )}

              {selectedAlbumId && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteAlbum(selectedAlbumId)}
                >
                  Delete album
                </Button>
              )}
            </>
          )}
        </div>

        {/* Upload bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm">Upload file</Label>
            {uploadsEnabled ? (
              <>
                <input
                  id={`file-input-${patientId}-${active}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.currentTarget.value = "";
                    onUpload(f);
                  }}
                />
                <Button asChild variant="outline" size="sm" disabled={uploading}>
                  <label htmlFor={`file-input-${patientId}-${active}`} className="cursor-pointer">
                    <UploadCloud className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Choose file"}
                  </label>
                </Button>
              </>
            ) : (
              <Badge variant="outline">Read-only</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { onRefresh(); onAlbumsRefresh(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <TabsContent value={active}>
          {loading ? (
            <div className="border rounded-md p-4 text-sm">Loading...</div>
          ) : forbidden ? (
            <div className="border rounded-md p-4 text-sm">
              <p className="mb-2">
                Access requires consent for <b className="uppercase">{active}</b>.
              </p>
              <p className="text-muted-foreground">
                Ask the patient to create a grant in their dashboard → Grants.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {uploadsEnabled ? "No files available for this filter." : "No data available yet."}
            </div>
          ) : (
            <div className="space-y-6">
              {groupByDate(items).map(([day, files]) => (
                <section key={day} className="space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground">{day}</div>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {files.map((f) => {
                      const isImg = isImageByNameOrMime(f);
                      const pdf = isPdf(f);
                      const sizeKb =
                        typeof f.size === "number" && f.size > 0
                          ? `${Math.round(f.size / 1024)} KB`
                          : undefined;

                      return (
                        <li key={f.id} className="border rounded-lg overflow-hidden bg-background">
                          <div className="aspect-video bg-muted/60 flex items-center justify-center">
                            {isImg ? (
                              <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                {pdf ? "PDF" : (extOf(f.name) || "FILE").toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="p-3 space-y-2">
                            <div className="text-sm font-medium truncate" title={f.name}>
                              {f.name}
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{prettyDate(f.createdAt)}</span>
                              {sizeKb && <span>{sizeKb}</span>}
                            </div>
                            {f.visibility && (
                              <Badge variant="outline" className="capitalize">
                                {f.visibility.toLowerCase()}
                              </Badge>
                            )}

                            {/* Move to album (assign) */}
                            {albums.length > 0 && (
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-muted-foreground">Move to:</label>
                                <select
                                  className="h-8 rounded-md border px-2 text-xs"
                                  value={f.albumId ?? ""}
                                  onChange={(e) =>
                                    assignToAlbum(f.id, e.target.value ? e.target.value : null)
                                  }
                                >
                                  <option value="">— none —</option>
                                  {albums.map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <a href={f.url} target="_blank" rel="noreferrer" className="grow">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Download className="mr-1 h-3.5 w-3.5" />
                                  Open / Download
                                </Button>
                              </a>
                              {uploadsEnabled && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => onDelete(f.name)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
