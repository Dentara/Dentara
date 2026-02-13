"use client";

import { use, useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PatientPublicProfileCard } from "@/components/clinic/PatientPublicProfileCard";

type ParamsType = { id: string };

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<ParamsType>;
}) {
  const { id: patientId } = use(params);

  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) throw new Error("Failed to fetch patient");

        const data = await res.json();
        setPatient(data);
        setAppointments(data.appointments ?? []);
        setPrescriptions(data.prescriptions ?? []);
        setBillingHistory(data.billing ?? []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchData();
  }, [patientId]);

  if (!patient) return <div className="p-10">Loading patient data...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Sol sütun – mövcud məlumat və tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src={patient.image || "/user.png"}
                alt={patient.name ?? "Patient"}
              />
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{patient.name}</h1>
              <p className="text-muted-foreground">{patient.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Gender:</span>{" "}
              <span>{patient.gender ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date of birth:</span>{" "}
              <span>
                {patient.dob
                  ? new Date(patient.dob).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{" "}
              <span>{patient.phone ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Doctor:</span>{" "}
              <span>{patient.doctor ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Condition:</span>{" "}
              <span>{patient.condition ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span>{patient.status ?? "—"}</span>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardContent className="p-4">
                  You have {appointments.length} appointment(s).
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions">
              {prescriptions.length > 0 ? (
                prescriptions.map((p: any) => (
                  <Card key={p.id} className="mb-2">
                    <CardContent className="p-4">
                      {p.medicationName} — {p.dosage}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No prescriptions found.
                </p>
              )}
            </TabsContent>

            <TabsContent value="billing">
              {billingHistory.length > 0 ? (
                billingHistory.map((b: any) => (
                  <Card key={b.id} className="mb-2">
                    <CardContent className="p-4">
                      {b.service} — ${b.amount} ({b.status})
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No billing records available.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sağ sütun – public profil kartı */}
        <div className="space-y-6">
          <PatientPublicProfileCard patientId={patientId} />
        </div>
      </div>
    </div>
  );
}
