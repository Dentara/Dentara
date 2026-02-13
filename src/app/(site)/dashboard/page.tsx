// app/(site)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

/**
 * Dashboard root → rola görə avtomatik yönləndirmə
 * clinic  → /dashboard/clinic
 * doctor  → /dashboard/doctor-self
 * patient → /dashboard/patient-self
 */
export default async function DashboardRoot() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;

  if (!role) redirect("/auth/signin");

  if (role === "clinic")  redirect("/dashboard/clinic");
  if (role === "doctor")  redirect("/dashboard/doctor-self");
  if (role === "patient") redirect("/dashboard/patient-self");

  redirect("/auth/signin");
}
