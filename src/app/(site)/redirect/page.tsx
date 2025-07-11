import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function RedirectHandler() {
  const session = await getServerSession(authOptions);

  const role = session?.user?.role;

  if (role === "clinic") redirect("/dashboard/clinic");
  if (role === "doctor") redirect("/dashboard/dentist");
  if (role === "patient") redirect("/dashboard/patient");

  redirect("/");
}
