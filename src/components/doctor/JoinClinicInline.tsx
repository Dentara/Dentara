"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
// mövcud komponentiniz – modal
import JoinClinicModal from "@/components/self/JoinClinicModal";

export default function JoinClinicInline() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      {/* @ts-expect-error Server→Client sərhədi */}
      <JoinClinicModal
        open={open}
        onOpenChange={(v: boolean) => setOpen(v)}
        trigger={null}
        defaultMode="clinicEmail"
      />
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Open</Button>
    </>
  );
}
