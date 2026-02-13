"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Attachment = {
  patientFile: {
    id: string;
    title?: string | null;
    path?: string | null;
    thumbnail?: string | null;
  };
};

export default function AttachmentTray({
  entryId,
  attachments,
  canEdit = true,
  onChange,
}: {
  entryId: string;
  attachments: Attachment[];
  canEdit?: boolean;
  onChange?: () => void;
}) {
  const [fileId, setFileId] = useState("");

  async function link() {
    if (!fileId) return;
    const res = await fetch(`/api/treatments/${entryId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientFileId: fileId }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j?.error || "Failed to link");
      return;
    }
    toast.success("Linked");
    setFileId("");
    onChange?.();
  }

  async function unlink(pid: string) {
    const res = await fetch(`/api/treatments/${entryId}/attachments/${pid}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j?.error || "Failed to unlink");
      return;
    }
    toast.success("Unlinked");
    onChange?.();
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Attachments</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {canEdit && (
          <div className="flex gap-2">
            <Input placeholder="PatientFile ID…" value={fileId} onChange={(e) => setFileId(e.target.value)} />
            <Button onClick={link}>Link</Button>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {attachments.map((a) => (
            <div key={a.patientFile.id} className="border rounded-md p-2">
              <div className="aspect-video bg-muted rounded mb-2 overflow-hidden flex items-center justify-center">
                {a.patientFile.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.patientFile.thumbnail}
                    alt={a.patientFile.title || "file"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">{a.patientFile.title || "file"}</span>
                )}
              </div>
              <div className="text-sm truncate">{a.patientFile.title || a.patientFile.id}</div>
              <div className="text-xs text-muted-foreground truncate">{a.patientFile.path}</div>
              {canEdit && (
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm" onClick={() => unlink(a.patientFile.id)}>
                    Unlink
                  </Button>
                </div>
              )}
            </div>
          ))}
          {attachments.length === 0 && <div className="text-sm text-muted-foreground">No attachments</div>}
        </div>
      </CardContent>
    </Card>
  );
}
