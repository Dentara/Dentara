// src/app/api/clinic/appointments/requests/route.ts

import { NextRequest, NextResponse } from "next/server";

let appointmentRequests = [
  {
    id: "1",
    patient: {
      name: "John Smith",
      image: "/colorful-abstract-shapes.png",
      phone: "+1 (555) 123-4567",
      email: "john.smith@example.com",
    },
    requestedDoctor: "Dr. Sarah Johnson",
    preferredDate: "2025-07-25",
    preferredTime: "Morning",
    reason: "Annual check-up",
    status: "Pending",
    requestedOn: "2025-07-15",
    type: "Check-up",
    urgency: "Normal",
    notes: "Patient has requested Dr. Johnson specifically.",
  },
  {
    id: "2",
    patient: {
      name: "Emily Davis",
      image: "/colorful-abstract-shapes.png",
      phone: "+1 (555) 234-5678",
      email: "emily.davis@example.com",
    },
    requestedDoctor: "Any cardiologist",
    preferredDate: "2025-07-28",
    preferredTime: "Afternoon",
    reason: "Heart palpitations",
    status: "Pending",
    requestedOn: "2025-07-16",
    type: "Consultation",
    urgency: "High",
    notes: "Patient has been experiencing heart palpitations for the past week.",
  },
];

export async function GET() {
  return NextResponse.json(appointmentRequests);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRequest = {
      id: (appointmentRequests.length + 1).toString(),
      ...body,
      status: "Pending",
      requestedOn: new Date().toISOString().split("T")[0],
    };
    appointmentRequests.push(newRequest);
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, scheduledDate, scheduledTime, rejectionReason, scheduledDoctor } = await req.json();

    const index = appointmentRequests.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    appointmentRequests[index] = {
      ...appointmentRequests[index],
      status,
      ...(status === "Approved" && {
        scheduledDate,
        scheduledTime,
        scheduledDoctor,
      }),
      ...(status === "Rejected" && {
        rejectionReason,
      }),
    };

    return NextResponse.json(appointmentRequests[index]);
  } catch (error) {
    return NextResponse.json({ error: "Invalid PATCH data" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    appointmentRequests = appointmentRequests.filter((r) => r.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid DELETE data" }, { status: 400 });
  }
}
