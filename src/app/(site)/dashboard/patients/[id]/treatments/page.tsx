import TreatmentLegend from "@/components/treatment/TreatmentLegend";
import ToothChart from "@/components/treatment/ToothChart";
import TreatmentTable from "@/components/treatment/TreatmentTable";
import TreatmentFormDialog from "@/components/treatment/TreatmentFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

async function getData(patientId: string) {
  const res = await fetch(`/api/treatments?patientId=${patientId}`, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function Page({ params }: { params: { id: string } }) {
  const patientId = params.id;
  const data = await getData(patientId);
  const items = Array.isArray(data.items) ? data.items : [];

  const lastPerTooth = new Map<number, any>();
  for (const it of items) {
    for (const t of it.teeth || []) {
      const color = catToColor(it.category as string);
      const prev = lastPerTooth.get(t.numberFDI);
      if (!prev || new Date(it.date) > new Date(prev.dateISO)) {
        lastPerTooth.set(t.numberFDI, {
          dateISO: it.date,
          code: it.procedureCode,
          name: it.procedureName,
          provider: it.doctor?.fullName,
          categoryColor: color,
        });
      }
    }
  }
  const summaries = Array.from(lastPerTooth.entries()).map(([numberFDI, last]) => ({ numberFDI, last }));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Patient Treatment – {patientId}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid gap-6">
            <TreatmentTable items={items} onDeleted={() => {}} allowDelete />
            <Suspense>
              <TreatmentFormDialog patientId={patientId} clinicId={null} doctorId={null} onCreated={() => {}} />
            </Suspense>
          </div>
          <div className="grid gap-6">
            <TreatmentLegend />
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Teeth map (latest)</CardTitle>
              </CardHeader>
              <CardContent>
                <ToothChart summaries={summaries} multiple readOnly />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function catToColor(c: string) {
  switch (c) {
    case "EXAM":
    case "PREVENTIVE":
      return "sky";
    case "RESTORATIVE":
      return "blue";
    case "ENDODONTIC":
      return "violet";
    case "PERIODONTIC":
      return "emerald";
    case "PROSTHETIC":
      return "amber";
    case "ORTHODONTIC":
      return "orange";
    case "SURGICAL":
    case "IMPLANT":
      return "rose";
    default:
      return "slate";
  }
}
