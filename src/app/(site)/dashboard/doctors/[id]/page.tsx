"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (!doctor) return notFound();

  // Status badge helper
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
              {doctor.dob
                ? new Date(doctor.dob).toLocaleDateString()
                : "-"}
            </div>
            <div>
              <strong>License Number:</strong> {doctor.licenseNumber}
            </div>
            <div>
              <strong>License Expiry:</strong>{" "}
              {doctor.licenseExpiryDate
                ? new Date(doctor.licenseExpiryDate).toLocaleDateString()
                : "-"}
            </div>
            <div>
              <strong>Status:</strong> {doctor.status}
            </div>
            <div>
              <strong>Patients:</strong> {doctor.patients ?? 0}
            </div>
          </CardContent>
        </Card>

        {/* Tabs – Overview, Appointments və s. */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Doctor</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {doctor.bio || doctor.qualifications
                ? (
                  <>
                    <div>
                      <strong>Bio:</strong>{" "}
                      {doctor.bio || <span className="text-muted">No biography</span>}
                    </div>
                    <div>
                      <strong>Qualifications:</strong>{" "}
                      {doctor.qualifications ||
                        <span className="text-muted">No qualifications</span>}
                    </div>
                  </>
                )
                : <span>No additional information provided.</span>
              }
            </CardContent>
          </Card>
          {/* Burada gələcəkdə appointment, təhsil, sertifikat və s. əlavə edilə bilər */}
        </div>
      </div>
    </div>
  );
}
