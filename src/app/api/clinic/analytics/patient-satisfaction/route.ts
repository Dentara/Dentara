import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { title: "Overall Experience", value: 87 },
    { title: "Wait Times", value: 72 },
    { title: "Staff Friendliness", value: 94 },
    { title: "Treatment Effectiveness", value: 89 },
  ]);
}
