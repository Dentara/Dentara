"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PortalStatusCell } from "@/components/portal/PortalStatusCell";

export type DoctorRow = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  primarySpecialization?: string | null;
  createdAt?: string | Date | null;
};

export const columns: ColumnDef<DoctorRow>[] = [
  {
    header: "Name",
    accessorKey: "fullName",
    cell: ({ row }) => <span className="font-medium">{row.original.fullName || "—"}</span>,
  },
  { header: "Email", accessorKey: "email" },
  { header: "Phone", accessorKey: "phone" },
  { header: "Specialization", accessorKey: "primarySpecialization" },

  // ✨ Yeni: Portal status
  {
    id: "portalStatus",
    header: "Portal",
    cell: ({ row }) => (
      <PortalStatusCell type="doctor" id={row.original.id} />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 90,
  },

  // (Opsiyonel) Actions — sonradan "Link by email" / "Invite" əlavə edəcəyik
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <div className="flex gap-2">
  //       <button className="text-blue-600 underline" onClick={() => {/* open modal */}}>
  //         Link
  //       </button>
  //       <button className="text-amber-600 underline" onClick={() => {/* send invite */}}>
  //         Invite
  //       </button>
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
];
