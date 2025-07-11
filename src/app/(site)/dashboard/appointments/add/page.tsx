"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddAppointmentPage() {
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState("");
  const [duration, setDuration] = useState("");
  const [room, setRoom] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // ➕ Yeni stomatoloji sahələr
  const [toothNumber, setToothNumber] = useState("");
  const [procedureType, setProcedureType] = useState("");
  const [price, setPrice] = useState("");

  const procedureOptions = [
    "Filling",
    "Root Canal",
    "Extraction",
    "Scaling",
    "Implant",
    "Crown",
    "X-ray",
    "Checkup",
  ];

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(data);
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        clinicId: "cmbg9438i0000czaialurf01u",
        doctorId: selectedDoctor?.id,
        patientId: selectedPatient?.id,
        patientName: selectedPatient?.fullName,
        type: appointmentType,
        date: appointmentDate.toISOString().split("T")[0],
        startTime: appointmentTime,
        endTime: "",
        duration,
        reason,
        status,
        notes,
        room,
        toothNumber,
        procedureType,
        price,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create appointment");

      await res.json();
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Appointment creation failed", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Appointment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ➕ Yeni sahələr formun bu hissəsinə əlavə olunur */}
          <div>
            <Label>Tooth Number</Label>
            <Input value={toothNumber} onChange={(e) => setToothNumber(e.target.value)} placeholder="e.g. 11, 26..." />
          </div>

          <div>
            <Label>Procedure Type</Label>
            <Select value={procedureType} onValueChange={setProcedureType}>
              <SelectTrigger>
                <SelectValue placeholder="Select procedure" />
              </SelectTrigger>
              <SelectContent>
                {procedureOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Price (₼)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 50" />
          </div>

          <div>
            <Label>Doctor</Label>
            <Select onValueChange={(id) => setSelectedDoctor(doctors.find(d => d.id === id))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Appointment Type</Label>
            <Input value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} />
          </div>

          <div>
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={appointmentDate}
              onSelect={setAppointmentDate}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label>Time</Label>
            <Input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>

          <div>
            <Label>Room</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} />
          </div>

          <div>
            <Label>Status</Label>
            <Select onValueChange={setStatus} defaultValue={status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <div>
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button onClick={handleSubmit}>Schedule Appointment</Button>
        </CardContent>
      </Card>
    </div>
  );
}