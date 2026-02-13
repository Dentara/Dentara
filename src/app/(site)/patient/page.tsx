// app/patient/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Self-portal giriş nöqtəsi (Patient).
 * Session və role yoxlanır, uğurlu olduqda /dashboard/patient-self-ə yönləndirir.
 */
export default async function PatientLanding() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?accountType=patient");
  }
  if ((session.user as any)?.role !== "patient") {
    redirect("/auth/signin?accountType=patient");
  }

  redirect("/dashboard/patient-self");
}
