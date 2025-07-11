import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const data = {
    chart: {
      "11": "Filled",
      "12": "Missing",
      "26": "Crown",
    },
  };
  return NextResponse.json(data);
}
