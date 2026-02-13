"use client";
import Link from "next/link";

export default function DoctorCard({ item }: { item: any }) {
  const name = item.fullName || item.name || "Unnamed Doctor";
  const clinicName = item?.clinic?.name || "";
  const rating = item?.ratingAvg ? Number(item.ratingAvg).toFixed(1) : "—";
  const slug = encodeURIComponent(item.fullName || item.name || "");

  return (
    <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg leading-tight truncate">{name}</h3>
            {item.hasVerified ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">VERIFIED</span>
            ) : null}
          </div>
          {clinicName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{clinicName}</p>
          )}
        </div>
        <div className="text-sm text-gray-500 shrink-0">★ {rating}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {slug ? (
          <Link href={`/doctor/${slug}`} className="text-blue-600 hover:underline">View Profile</Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed">View Profile</span>
        )}
      </div>
    </div>
  );
}
