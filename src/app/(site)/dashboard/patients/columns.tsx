import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Patient } from "./data/schema";

// ✨ əlavə: portal badge hüceyrəsi
import { PortalStatusCell } from "@/components/portal/PortalStatusCell";

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name || "-",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original.gender || "-",
  },
  {
    accessorKey: "dob",
    header: "DOB",
    cell: ({ row }) => row.original.dob || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "-",
  },
  // ✅ Yeni sahələr əlavə olundu:
  {
    accessorKey: "lastAppointment.date",
    header: "Last Appt",
    cell: ({ row }) => row.original.lastAppointment?.date || "-",
  },
  {
    accessorKey: "lastAppointment.toothNumber",
    header: "Tooth",
    cell: ({ row }) => row.original.lastAppointment?.toothNumber || "-",
  },
  {
    accessorKey: "lastAppointment.procedureType",
    header: "Procedure",
    cell: ({ row }) => row.original.lastAppointment?.procedureType || "-",
  },

  // ✨ YENİ: Portal status (ClinicPatient.id əsasında)
  {
    id: "portalStatus",
    header: "Portal",
    cell: ({ row }) => (
      // row.original.id mövcud tipdə (Patient) varsa birbaşa işləyəcək.
      // Əgər səndə list ClinicPatient-dəndirsə, Patient tipinə id: string sahəsi əlavə et.
      <PortalStatusCell type="patient" id={String((row.original as any).id)} />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 90,
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.status || "Unknown"}
      </Badge>
    ),
  },
];
