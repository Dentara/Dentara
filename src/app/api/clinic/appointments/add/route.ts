// src/app/api/clinic/appointments/add/route.ts

import { NextResponse } from "next/server";

// Yaddaşda saxlanılan müvəqqəti appointment siyahısı
let appointmentList: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validasiya yoxlaması (sadə)
    if (!body.patientId || !body.doctorId || !body.date || !body.time || !body.reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAppointment = {
      id: (appointmentList.length + 1).toString(),
      patientId: body.patientId,
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      endTime: body.endTime || null,
      duration: body.duration,
      reason: body.reason,
      type: body.appointmentType,
      status: body.status || "scheduled",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    appointmentList.push(newAppointment);

    return NextResponse.json({ success: true, appointment: newAppointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
