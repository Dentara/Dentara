import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const data = [
    {
      tooth: "26",
      procedure: "Filling",
      date: "2024-06-01",
      doctor: "Dr. Tagiyev",
      note: "Composite",
    },
    {
      tooth: "11",
      procedure: "Root Canal",
      date: "2024-05-12",
      doctor: "Dr. Sia",
      note: "Completed in 3 visits",
    },
  ];

  return NextResponse.json(data);
}
