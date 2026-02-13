"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function ClinicReviewDialog({
  clinicId,
  triggerLabel = "Rate clinic",
  onSaved,
}: {
  clinicId: string;
  triggerLabel?: string;
  onSaved?: (r: { rating: number; comment: string | null }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  async function handleSubmit() {
    if (!rating) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        onSaved?.({ rating, comment: comment || null });
        setOpen(false);
      } else {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const star = (i: number) => (
    <button
      key={i}
      type="button"
      onClick={() => setRating(i)}
      onMouseEnter={() => setHover(i)}
      onMouseLeave={() => setHover(null)}
      className="p-1"
    >
      <Star className={`w-6 h-6 ${((hover ?? rating) ?? 0) >= i ? "fill-yellow-400 stroke-yellow-400" : "stroke-muted-foreground"}`} />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="inline-flex w-max shrink-0">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Rate this clinic</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-1">{[1,2,3,4,5].map(star)}</div>
          <Textarea rows={4} value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Your comment (optional)..." />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !rating}>{loading ? "Saving..." : "Save review"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
