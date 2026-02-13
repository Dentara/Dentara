// components/portal/PortalStatusBadge.tsx
export function PortalStatusBadge({ status }: { status: "linked" | "pending" | "none" }) {
  const colors =
    status === "linked"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "pending"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  const label =
    status === "linked" ? "Linked" : status === "pending" ? "Pending" : "None";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${colors}`}>
      {label}
    </span>
  );
}
