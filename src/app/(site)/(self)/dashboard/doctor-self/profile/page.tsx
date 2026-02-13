export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import CredentialsSection from "@/components/doctor/CredentialsSection";

async function getLinkedClinicsCount(userEmail?: string | null, userId?: string | null) {
  let cnt = 0;
  try {
    const doc = await prisma.doctor.findFirst({
      where: { email: userEmail || "" },
      select: { clinicId: true },
    });
    if (doc?.clinicId) cnt = 1;
  } catch {}
  try {
    const joins = await prisma.clinicDoctor.findMany({
      where: { userId: userId || "" },
      select: { clinicId: true },
    });
    if (joins?.length && joins.length > cnt) cnt = joins.length;
  } catch {}
  return cnt;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return null;

  const linkedClinicsCount = await getLinkedClinicsCount(user?.email, user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile &amp; Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, security and preferences.
        </p>
      </div>

      <ProfileHeader
        name={user?.name || "—"}
        email={user?.email || "—"}
        role={String(user?.role || "doctor")}
        linkedClinicsCount={linkedClinicsCount}
      />

      <ProfileTabs
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "contact", label: "Contact" },
          { key: "preferences", label: "Preferences" },
          { key: "security", label: "Security" },
          { key: "devices", label: "Devices" },
          { key: "data", label: "Data" },
          { key: "public-profile", label: "Public profile" },
        ]}
        user={user}
        linkedClinicsCount={linkedClinicsCount}
        basePath="/dashboard/doctor-self"
        contextRole="doctor"
        apiBase="/api/account"
      />

      {/* Diplomas & Certificates — həkim profilində ayrıca bölmə */}
      <div className="mt-6">
        <CredentialsSection />
      </div>
    </div>
  );
}
