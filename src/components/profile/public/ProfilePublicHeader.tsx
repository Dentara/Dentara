"use client";

export default function ProfilePublicHeader({
  title,
  subtitle,
  meta,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
        )}
        {meta && <p className="text-sm text-gray-500 mt-1">{meta}</p>}
      </div>
      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </div>
  );
}
