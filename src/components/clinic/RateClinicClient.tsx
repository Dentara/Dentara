"use client";
import ClinicReviewDialog from "@/components/clinic/ClinicReviewDialog";

export default function RateClinicClient({ clinicId }: { clinicId: string }) {
  if (!clinicId) return null;
  return (
    <div className="mt-3">
      <ClinicReviewDialog clinicId={clinicId} triggerLabel="Rate clinic" />
    </div>
  );
}
