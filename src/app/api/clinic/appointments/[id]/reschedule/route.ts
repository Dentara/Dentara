// src/app/api/clinic/appointments/[id]/reschedule/route.ts

import { NextResponse } from "next/server";

// Müvəqqəti yaddaşda saxlanan randevular
let appointmentList = [
  {
    id: "1",
    date: "2023-07-15",
    time: "10:00",
    endTime: "10:30",
    reason: "Annual physical examination",
    status: "Confirmed",
    updatedAt: "2023-07-01T09:12:30Z",
  },
  {
    id: "2",
    date: "2023-07-16",
    time: "11:00",
    endTime: "11:30",
    reason: "Consultation",
    status: "In Progress",
    updatedAt: "2023-07-01T09:12:30Z",
  },
  // Əlavə randevular varsa bura əlavə et...
];

// PATCH — Randevunu yenidən planlaşdırmaq üçün
export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const data = await req.json();

    // Randevunu tap
    const index = appointmentList.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Yenilə
    appointmentList[index] = {
      ...appointmentList[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully",
      updated: appointmentList[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
