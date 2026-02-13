// app/(site)/dashboard/patient-self/files/patient-self-files.client.tsx
"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

type ScopeKey = "xrays" | "face" | "teeth" | "attachments" | "billing";

type FileItem = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  size?: number | null;
  visibility?: string | null;
  mime?: string | null;
  albumId?: string | null;
};

type AlbumItem = {
  id: string;
  title: string;
  scope: string;
  createdAt: string;
};

const SCOPES: { key: ScopeKey; label: string }[] = [
  { key: "xrays",       label: "X-Rays" },
  { key: "face",        label: "Face" },
  { key: "teeth",       label: "Teeth" },
  { key: "attachments", label: "Attachments" },
  { key: "billing",     label: "Billing" },
];

function extOf(nameOrUrl: string) {
  const m = nameOrUrl.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return (m?.[1] || "").toLowerCase();
}
function isImage(f: Pick<FileItem, "name" | "url" | "mime">) {
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

export default function PatientSelfFilesClient() {
  const [active, setActive] = useState<ScopeKey>("xrays");
  const [items, setItems] = useState<FileItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [version, setVersion] = useState(0);
  const [albumsVersion, setAlbumsVersion] = useState(0);

  // Self API-lər
  const baseUrl = useMemo(() => `/api/patient/files`, []);
  const albumsUrl = useMemo(() => `/api/patient/files/albums`, []);

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

  // Tab dəyişəndə albom filtrini sıfırla
  useEffect(() => {
    setSelectedAlbumId(null);
  }, [active]);

  const onRefresh = () => setVersion((v) => v + 1);
  const onAlbumsRefresh = () => setAlbumsVersion((v) => v + 1);

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

        {/* Albom bar (read-only) */}
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
            albums.map((a) => (
              <Button
                key={a.id}
                variant={selectedAlbumId === a.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedAlbumId(a.id)}
                className="flex items-center gap-2"
                title={`${a.title} — ${prettyDate(a.createdAt)}`}
              >
                {a.title}
              </Button>
            ))
          )}

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
                Ask the clinic to request access or check your sharing settings.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No files found.</div>
          ) : (
            <div className="space-y-6">
              {groupByDate(items).map(([day, files]) => (
                <section key={day} className="space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground">{day}</div>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {files.map((f) => {
                      const image = isImage(f);
                      const pdf = isPdf(f);
                      const sizeKb = typeof f.size === "number" && f.size > 0 ? `${Math.round(f.size / 1024)} KB` : undefined;

                      return (
                        <li key={f.id} className="border rounded-lg overflow-hidden bg-background">
                          <div className="aspect-video bg-muted/60 flex items-center justify-center">
                            {image ? (
                              <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                {pdf ? "PDF" : (extOf(f.name) || "FILE").toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="p-3 space-y-2">
                            <div className="text-sm font-medium truncate" title={f.name}>{f.name}</div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{prettyDate(f.createdAt)}</span>
                              {sizeKb && <span>{sizeKb}</span>}
                            </div>
                            {f.visibility && (
                              <Badge variant="outline" className="capitalize">
                                {String(f.visibility).toLowerCase()}
                              </Badge>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              <a href={f.url} target="_blank" rel="noreferrer" className="grow">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Download className="mr-1 h-3.5 w-3.5" />
                                  Open / Download
                                </Button>
                              </a>
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
