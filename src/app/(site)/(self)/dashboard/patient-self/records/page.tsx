// Temporary redirect to Files (keeps old bookmarks working)
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page() {
  redirect("/dashboard/patient-self/files");
}
