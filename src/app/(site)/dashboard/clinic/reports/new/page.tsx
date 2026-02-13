export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Generate New Report</h1>
      <p className="text-sm text-muted-foreground">
        Select a report type and time range to generate a new report.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <a href="/dashboard/clinic/reports/financial" className="rounded-lg border p-4 hover:bg-muted">
          <h3 className="font-medium">Financial</h3>
          <p className="text-sm text-muted-foreground">Revenue, expenses, claims</p>
        </a>
        <a href="/dashboard/clinic/reports/patients" className="rounded-lg border p-4 hover:bg-muted">
          <h3 className="font-medium">Patients</h3>
          <p className="text-sm text-muted-foreground">Registrations, demographics, visits</p>
        </a>
        <a href="/dashboard/clinic/reports/operational" className="rounded-lg border p-4 hover:bg-muted">
          <h3 className="font-medium">Operational</h3>
          <p className="text-sm text-muted-foreground">Staff metrics, inventory, rooms</p>
        </a>
      </div>
    </div>
  );
}
