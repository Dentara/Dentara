// app/doctor/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Self-portal giriş nöqtəsi (Doctor).
 * Qayda:
 * - Session yoxdursa → doctor tipli sign-in
 * - Session var, amma role !== "doctor" → doctor sign-in
 * - Doğru olduqda → /dashboard/doctor-self
 *
 * Qeyd: Klinik (admin) panelinə toxunmur.
 */
export default async function DoctorLanding() {
  const session = await getServerSession(authOptions);

  // Session yoxdursa → doctor hesabı üçün sign-in
  if (!session?.user) {
    redirect("/auth/signin?accountType=doctor");
  }

  // Rol uyğun deyil → doctor sign-in
  // (Rol adları: "clinic" | "doctor" | "patient")
  if ((session.user as any)?.role !== "doctor") {
    redirect("/auth/signin?accountType=doctor");
  }

  // Doğrudursa → self dashboard-a yönləndir
  redirect("/dashboard/doctor-self");
}
