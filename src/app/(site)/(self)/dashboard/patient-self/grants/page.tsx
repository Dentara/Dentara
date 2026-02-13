// app/(site)/dashboard/patient-self/grants/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  // Old grants UI -> redirect to new Files
  redirect("/dashboard/patient-self/files");
}
