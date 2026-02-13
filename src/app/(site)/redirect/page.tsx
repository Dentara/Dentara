// app/redirect/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session) {
    redirect("/"); // login yoxdursa home
  }

  switch (role) {
    case "clinic":
      redirect("/dashboard/clinic");
    case "doctor":
      redirect("/dashboard/doctor-self");
    case "patient":
      redirect("/dashboard/patient-self");
    default:
      redirect("/");
  }
}
