"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

type Props = {
  treatmentId: string;
  triggerLabel?: string;
  onSaved?: (review: { rating: number; comment: string | null }) => void;
};

type ReviewResponse = {
  review?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
};

export default function TreatmentReviewDialog({
  treatmentId,
  triggerLabel = "Write review",
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Dialog açılarkən hazırkı review-i çək
  useEffect(() => {
    if (!open || initialLoaded) return;

    (async () => {
      try {
        const res = await fetch(`/api/treatments/${treatmentId}/review`, {
          method: "GET",
        });
        if (!res.ok) return;
        const data: ReviewResponse = await res.json();
        if (data.review) {
          setRating(data.review.rating);
          setComment(data.review.comment ?? "");
        }
      } catch (e) {
        console.error("Failed to load review", e);
      } finally {
        setInitialLoaded(true);
      }
    })();
  }, [open, initialLoaded, treatmentId]);

  async function handleSubmit() {
    if (!rating) {
      alert("Please select a rating between 1 and 5.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/treatments/${treatmentId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert((data as any).error || "Failed to save review");
        return;
      }

      const data = await res.json().catch(() => ({}));
      const saved = (data as any).review ?? {
        rating,
        comment: comment || null,
      };

      onSaved?.({
        rating: saved.rating,
        comment: saved.comment ?? null,
      });

      setOpen(false);
    } catch (e) {
      console.error("Failed to save review", e);
      alert("Failed to save review");
    } finally {
      setLoading(false);
    }
  }

  function renderStar(index: number) {
    const filled = (hoverRating ?? rating ?? 0) >= index;
    return (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index)}
        onMouseEnter={() => setHoverRating(index)}
        onMouseLeave={() => setHoverRating(null)}
        className="p-1"
      >
        <Star
          className={`w-6 h-6 ${filled ? "fill-yellow-400 stroke-yellow-400" : "stroke-muted-foreground"}`}
        />
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex w-max shrink-0"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate this treatment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(renderStar)}
          </div>
          <Textarea
            placeholder="Write your feedback (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !rating}>
              {loading ? "Saving…" : "Save review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
