import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    financial: [
      { name: "Monthly Revenue Summary",     updated: "Today" },
      { name: "Quarterly Financial Analysis",updated: "Last week" },
      { name: "Insurance Claims Report",     updated: "2 days ago" },
      { name: "Outstanding Payments",        updated: "Yesterday" },
    ],
    patient: [
      { name: "New Patient Registrations",   updated: "Today" },
      { name: "Patient Demographics",        updated: "3 days ago" },
      { name: "Visit Frequency Analysis",    updated: "Last week" },
      { name: "Treatment Outcomes",          updated: "Yesterday" },
    ],
    operational: [
      { name: "Staff Performance Metrics",   updated: "Today" },
      { name: "Inventory Status",            updated: "Today" },
      { name: "Room Utilization",            updated: "2 days ago" },
      { name: "Wait Time Analysis",          updated: "Last week" },
    ],
  });
}
