"use client";
export default function PatientCard({ item }: { item: any }) {
  const name = item.name || "Patient";
  const location = [item?.city, item?.country].filter(Boolean).join(", ");
  return (
    <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
      <h3 className="font-semibold text-lg">{name}</h3>
      {location && <p className="text-sm text-gray-500">{location}</p>}
      <p className="text-xs text-gray-400 mt-2">Public listing (basic info only)</p>
    </div>
  );
}
