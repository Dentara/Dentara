"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { DoctorPublicProfileCard } from "@/components/clinic/DoctorPublicProfileCard";

type EmploymentRow = {
  id: string;
  startedAt: string | null;
  endedAt: string;
  statusAtEnd: string;
  reason: string | null;
  clinic: { id: string; name: string | null };
};

export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<EmploymentRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        if (!res.ok) throw new Error("Doctor not found");
        const data = await res.json();
        setDoctor(data);
      } catch (err) {
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const r = await fetch(`/api/doctors/${doctorId}/employment`);
        if (!r.ok) throw new Error("history failed");
        const d = (await r.json()) as EmploymentRow[];
        setHistory(Array.isArray(d) ? d : []);
      } catch {
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [doctorId]);

  if (loading) return <div>Loading...</div>;
  if (!doctor) return notFound();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "On Leave":
        return "border-amber-500 text-amber-500";
      default:
        return "bg-gray-500";
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "On Leave":
        return "outline";
      default:
        return "secondary";
    }
  };

  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/doctors">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to doctors</span>
          </Link>
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
          Doctor Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={doctor.profilePhoto || "/user-2.png"}
                alt={doctor.fullName || "Doctor"}
              />
              <AvatarFallback>
                {doctor.fullName?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{doctor.fullName}</CardTitle>
            <div className="mt-2">
              <Badge
                variant={getStatusVariant(doctor.status)}
                className={getStatusColor(doctor.status)}
              >
                {doctor.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              <strong>Specialization:</strong> {doctor.specialization}
            </div>
            <div>
              <strong>Department:</strong> {doctor.department}
            </div>
            <div>
              <strong>Experience:</strong> {doctor.experience} years
            </div>
            <div>
              <strong>Email:</strong> {doctor.email}
            </div>
            <div>
              <strong>Phone:</strong> {doctor.phone}
            </div>
            <div>
              <strong>Address:</strong> {doctor.address}
            </div>
            <div>
              <strong>Gender:</strong> {doctor.gender}
            </div>
            <div>
              <strong>Date of Birth:</strong>{" "}
              {doctor.birthDate
                ? new Date(doctor.birthDate).toLocaleDateString()
                : "-"}
            </div>
            <div>
              <strong>Passport/ID:</strong> {doctor.passportNumber}
            </div>
            <div>
              <strong>Status:</strong> {doctor.status}
            </div>
            <div>
              <strong>Patients:</strong> {doctor.patients ?? 0}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="md:col-span-2 space-y-6">
          {/* Public profile card */}
          <DoctorPublicProfileCard doctorId={doctorId} />

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About Doctor</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>
                <strong>Bio:</strong>{" "}
                {doctor.bio || (
                  <span className="text-muted">No biography</span>
                )}
              </div>
              <div>
                <strong>Qualifications:</strong>{" "}
                {doctor.qualifications || (
                  <span className="text-muted">No qualifications</span>
                )}
              </div>
              <div>
                <strong>Certificates:</strong>{" "}
                {Array.isArray(doctor.certificates) &&
                doctor.certificates.length > 0 ? (
                  <ul className="list-disc ml-5">
                    {doctor.certificates.map((cert: any, idx: number) => (
                      <li key={idx}>
                        {cert.title}
                        {cert.fileUrl && (
                          <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 underline"
                          >
                            View file
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">No certificates</span>
                )}
              </div>
              <div>
                <strong>Diploma:</strong>{" "}
                {doctor.diplomaFile ? (
                  <a
                    href={doctor.diplomaFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Diploma
                  </a>
                ) : (
                  <span className="text-muted">No diploma file</span>
                )}
              </div>
              <div>
                <strong>Diploma Additions:</strong>{" "}
                {Array.isArray(doctor.diplomaAdditions) &&
                doctor.diplomaAdditions.length > 0 ? (
                  <ul className="list-disc ml-5">
                    {doctor.diplomaAdditions.map(
                      (fileUrl: string, idx: number) => (
                        <li key={idx}>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Addition {idx + 1}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <span className="text-muted">No additions</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employment History */}
          <Card>
            <CardHeader>
              <CardTitle>Employment History</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {loadingHistory ? (
                <div className="text-muted-foreground">Loading history…</div>
              ) : history.length === 0 ? (
                <div className="text-muted-foreground">
                  No archived employment records.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 pr-4">Clinic</th>
                        <th className="py-2 pr-4">Started</th>
                        <th className="py-2 pr-4">Ended</th>
                        <th className="py-2 pr-4">Status at End</th>
                        <th className="py-2 pr-4">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            {row.clinic?.name || "-"}
                          </td>
                          <td className="py-2 pr-4">
                            {fmt(row.startedAt)}
                          </td>
                          <td className="py-2 pr-4">
                            {fmt(row.endedAt)}
                          </td>
                          <td className="py-2 pr-4">
                            <Badge variant="outline">
                              {row.statusAtEnd}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4">
                            {row.reason || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
