import { NextResponse } from "next/server";

type ReportActivity = {
  userId?: string;              // gələcəkdə DB-dən doldurula bilər
  report: string;
  time: string;
  action: "Generated" | "Viewed";
};

export async function GET() {
  // Test adları YOXDUR — hazırda boş siyahı qaytarırıq.
  const recent: ReportActivity[] = [];
  return NextResponse.json(recent);
}
