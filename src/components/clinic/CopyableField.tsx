"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export default function CopyableField({
  label,
  value,
  placeholder = "—",
  disabled = false,
}: {
  label: string;
  value?: string | null;
  placeholder?: string;
  disabled?: boolean;
}) {
  const text = value ?? "";
  const canCopy = !!text && !disabled;

  const handleCopy = () => {
    if (canCopy && typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(text);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <Input readOnly value={text} placeholder={placeholder} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          disabled={!canCopy}
          title={canCopy ? "Copy" : "Nothing to copy"}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
