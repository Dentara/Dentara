//app/(site)/(self)/dashboard/patient-self/clinics/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Linked clinics — stabil API:
 * GET /api/patient/linked-clinics?patientUserId=&patientEmail=
 * Qaytarır: [{ id, name }]
 */
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const patientUserId = (user as any)?.id || "";
  const patientEmail = user?.email || "";

  const hdr = await headers();
  const origin =
    (hdr.get("x-forwarded-proto") && hdr.get("host"))
      ? `${hdr.get("x-forwarded-proto")}://${hdr.get("host")}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const qs = new URLSearchParams();
  if (patientUserId) qs.set("patientUserId", patientUserId);
  if (patientEmail) qs.set("patientEmail", patientEmail);

  let clinics: { id: string; name: string }[] = [];
  try {
    const r = await fetch(`${origin}/api/patient/linked-clinics?${qs.toString()}`, { cache: "no-store" });
    const j = r.ok ? await r.json() : [];
    clinics = Array.isArray(j) ? j : [];
  } catch {
    clinics = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Linked Clinics</h1>
        <p className="text-sm text-muted-foreground">
          Clinics connected to your account. Open the calendar to request a new appointment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {clinics.length === 0 ? (
            <div className="text-sm text-muted-foreground">No clinic linked yet.</div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clinics.map((c) => (
                <li key={c.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.name || "Clinic"}</div>
                    <Badge variant="secondary" className="mt-1">ACTIVE</Badge>
                  </div>
                  <Button asChild variant="outline" size="sm" title="Open clinic calendar">
                    <Link href={`/dashboard/patient-self/appointments?clinicId=${encodeURIComponent(c.id)}`}>
                      Open Calendar
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
