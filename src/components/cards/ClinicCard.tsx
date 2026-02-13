"use client";

import Link from "next/link";

type ClinicCardProps = {
  item: {
    id: string;
    name?: string | null;
    city?: string | null;
    country?: string | null;
    ratingAvg?: number | null; // optional, future use
  };
};

export default function ClinicCard({ item }: ClinicCardProps) {
  const name = item.name || "Unnamed Clinic";
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const rating =
    typeof item?.ratingAvg === "number" ? item.ratingAvg.toFixed(1) : "—";

  const slug = encodeURIComponent(item.name || "");

  return (
    <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg leading-tight truncate">{name}</h3>
          {location && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{location}</p>
          )}
        </div>
        <div className="text-sm text-gray-500 shrink-0">★ {rating}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {slug ? (
          <Link href={`/clinic/${slug}`} className="text-blue-600 hover:underline">
            View Profile
          </Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed">View Profile</span>
        )}
      </div>
    </div>
  );
}
