import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const doctor = url.searchParams.get("doctor") ?? "all";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let appointments = [
    {
      id: "1",
      patient: { name: "John Smith", image: "/colorful-abstract-shapes.png" },
      doctor: "Dr. Sarah Johnson",
      date: "2025-05-14",
      time: "10:00 AM",
      endTime: "10:30 AM",
      status: "Confirmed",
      type: "Check-up",
      duration: 30,
      department: "General Medicine",
      color: "blue",
    },
    {
      id: "2",
      patient: { name: "Emily Davis", image: "/colorful-abstract-shapes.png" },
      doctor: "Dr. Michael Chen",
      date: "2025-05-14",
      time: "11:30 AM",
      endTime: "12:15 PM",
      status: "In Progress",
      type: "Consultation",
      duration: 45,
      department: "Cardiology",
      color: "amber",
    },
    {
      id: "3",
      patient: { name: "Robert Wilson", image: "/user-3.png" },
      doctor: "Dr. Lisa Patel",
      date: "2025-05-14",
      time: "02:15 PM",
      endTime: "02:35 PM",
      status: "Completed",
      type: "Follow-up",
      duration: 20,
      department: "Orthopedics",
      color: "green",
    },
    {
      id: "4",
      patient: { name: "Jessica Brown", image: "/user-3.png" },
      doctor: "Dr. James Wilson",
      date: "2025-05-15",
      time: "09:00 AM",
      endTime: "10:00 AM",
      status: "Confirmed",
      type: "Dental Cleaning",
      duration: 60,
      department: "Dental",
      color: "purple",
    },
    {
      id: "5",
      patient: { name: "Michael Johnson", image: "/user-3.png" },
      doctor: "Dr. Emily Rodriguez",
      date: "2025-05-15",
      time: "10:30 AM",
      endTime: "10:45 AM",
      status: "Confirmed",
      type: "X-Ray",
      duration: 15,
      department: "Radiology",
      color: "indigo",
    },
    {
      id: "6",
      patient: { name: "Sarah Thompson", image: "/user-3.png" },
      doctor: "Dr. Robert Kim",
      date: "2025-05-13",
      time: "01:45 PM",
      endTime: "02:30 PM",
      status: "Cancelled",
      type: "Therapy Session",
      duration: 45,
      department: "Psychiatry",
      color: "red",
    },
    {
      id: "7",
      patient: { name: "David Miller", image: "/user-3.png" },
      doctor: "Dr. Jennifer Lee",
      date: "2025-05-12",
      time: "11:00 AM",
      endTime: "12:00 PM",
      status: "Completed",
      type: "Annual Physical",
      duration: 60,
      department: "General Medicine",
      color: "blue",
    },
    {
      id: "8",
      patient: { name: "Amanda Clark", image: "/user-3.png" },
      doctor: "Dr. Thomas Brown",
      date: "2025-05-11",
      time: "09:30 AM",
      endTime: "09:45 AM",
      status: "Cancelled",
      type: "Vaccination",
      duration: 15,
      department: "Pediatrics",
      color: "teal",
    },
    {
      id: "9",
      patient: { name: "Kevin Martinez", image: "/user-3.png" },
      doctor: "Dr. Sarah Johnson",
      date: "2025-05-17",
      time: "02:00 PM",
      endTime: "02:30 PM",
      status: "Confirmed",
      type: "Check-up",
      duration: 30,
      department: "General Medicine",
      color: "blue",
    },
    {
      id: "10",
      patient: { name: "Sophia Wilson", image: "/user-3.png" },
      doctor: "Dr. Michael Chen",
      date: "2025-05-15",
      time: "10:15 AM",
      endTime: "11:00 AM",
      status: "Confirmed",
      type: "Consultation",
      duration: 45,
      department: "Neurology",
      color: "green",
    },
  ];

  if (doctor !== "all") {
    appointments = appointments.filter((a) => a.doctor === doctor);
  }

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    appointments = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= fromDate && d <= toDate;
    });
  }

  return NextResponse.json(appointments);
}
