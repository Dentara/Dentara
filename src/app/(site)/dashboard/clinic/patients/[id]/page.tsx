import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClinicPatientRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/clinic/patients?query=${encodeURIComponent(id)}`);
}
