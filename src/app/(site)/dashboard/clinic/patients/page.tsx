// app/(site)/dashboard/clinic/patients/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

export const dynamic = "force-dynamic";

/**
 * Klinika dashboard → Patients.
 *
 * Ground truth: ClinicPatient modeli.
 * - Default olaraq yalnız ACTIVE pasiyentlər göstərilir.
 * - `?query=` → id / email / fullName üzrə axtarış.
 */
export default async function ClinicPatientsListPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;

  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const clinicId =
    role === "clinic" ? ((session?.user as any)?.id as string) : undefined;

  if (!clinicId) {
    // klinika hesabı yoxdursa, login-ə yönləndir
    redirect("/auth/signin?accountType=clinic");
  }

  const qRaw = sp?.query;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw; // string | undefined
  const statusRaw = sp?.status;
  const statusParam = (
    Array.isArray(statusRaw) ? statusRaw[0] : statusRaw
  )?.toString();
  // default olaraq yalnız ACTIVE, amma ?status=INVITED və ya ?status=ALL dəstəklənir
  const statusFilter =
    statusParam === "INVITED"
      ? "INVITED"
      : statusParam === "ALL"
      ? "ALL"
      : "ACTIVE";

  // ClinicPatient üzərindən filter
  const where: any = {
    clinicId,
  };

  if (statusFilter !== "ALL") {
    where.status = statusFilter;
  }

  if (q && q.trim().length > 0) {
    const term = q.trim();
    where.OR = [
      { id: term },
      { email: { contains: term, mode: "insensitive" as const } },
      { fullName: { contains: term, mode: "insensitive" as const } },
    ];
  }

  const clinicPatients = await prisma.clinicPatient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      createdAt: true,
      patientId: true,
      patientUserId: true,
    },
  });

  const total = clinicPatients.length;
  const filterLabel =
    statusFilter === "ALL"
      ? "All"
      : statusFilter === "INVITED"
      ? "Invited"
      : "Active";

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your patients and their medical records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* TODO: buraya real create / invite axınlarını sonra bağlayarıq */}
          <button className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            + Add Patient
          </button>
          <button className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Invite Patient
          </button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Patients List</CardTitle>
            <CardDescription>
              A list of all patients linked to this clinic.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <form
              action="/dashboard/clinic/patients"
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                name="query"
                defaultValue={q ?? ""}
                placeholder="Search by name, email or ID…"
                className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
              <select
                name="status"
                defaultValue={statusFilter}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="INVITED">Invited</option>
                <option value="ALL">All</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Apply
              </button>
            </form>
            {total > 0 && (
              <span className="text-xs text-muted-foreground">
                {total} {filterLabel.toLowerCase()} patient
                {total === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        <CardContent>
          {total === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              No patients found for this clinic.
            </p>
          ) : (
            <ul className="space-y-2">
              {clinicPatients.map((p) => {
                const joinedAt = new Date(p.createdAt).toLocaleString();
                const status = p.status ?? "UNKNOWN";
                const statusClass =
                  status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "INVITED"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-800";

                const historyId = p.patientId || p.patientUserId || p.id;

                return (
                  <li
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border px-3 py-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {p.fullName || "Patient"}
                        </span>
                        <Badge
                          variant="outline"
                          className={statusClass + " text-[11px] px-2 py-0.5"}
                        >
                          {status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.email || "No email"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Linked: {joinedAt}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {historyId && (
                        <Link
                          href={`/dashboard/clinic/patient-treatments/${historyId}`}
                          className="text-sm underline"
                        >
                          Open history
                        </Link>
                      )}
                      {p.email && (
                        <a
                          href={`mailto:${p.email}`}
                          className="text-sm underline"
                        >
                          Email
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
