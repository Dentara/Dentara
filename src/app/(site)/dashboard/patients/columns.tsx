import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Patient } from "./data/schema";

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