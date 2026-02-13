export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

import OverviewSection from "@/components/profile/sections/OverviewSection";
import ContactSection from "@/components/profile/sections/ContactSection";
import PreferencesSection from "@/components/profile/sections/PreferencesSection";
import SecuritySection from "@/components/profile/sections/SecuritySection";
import DevicesSection from "@/components/profile/sections/DevicesSection";
import DataSection from "@/components/profile/sections/DataSection";

/** SSR absolute origin helper (cookie-forward SSR pattern) */
async function getOrigin() {
  const hdr = await headers();
  const xfProto = hdr.get("x-forwarded-proto");
  const host = hdr.get("host");
  if (xfProto && host) return `${xfProto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const origin = await getOrigin();

  const user = session?.user as any;
  const name = user?.name ?? "—";
  const email = user?.email ?? "—";
  const role = (user?.role ?? "patient") as string;

  // Avatar cookie (V2: upload sonrası server cookie-də saxlanır)
  const cookieStore = await cookies();
  const avatarUrl = cookieStore.get(`avatar_${user?.id || ""}`)?.value || null;


  // Linked clinics sayı
  let linkedClinicsCount = 0;
  try {
    const qs = new URLSearchParams();
    if (user?.id) qs.set("patientUserId", user.id);
    if (user?.email) qs.set("patientEmail", user.email);
    const r = await fetch(`${origin}/api/patient/linked-clinics?${qs}`, {
      cache: "no-store",
      headers: { cookie: (await headers()).get("cookie") || "" },
    });
    const j = r.ok ? await r.json() : [];
    if (Array.isArray(j)) linkedClinicsCount = j.length;
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile &amp; Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and preferences. Editing will be enabled soon.
        </p>
      </div>

      {/* Header (avatar, name, email, role, quick stats) */}
      <ProfileHeader
        name={name}
        email={email}
        role={role}
        linkedClinicsCount={linkedClinicsCount}
        avatarUrl={avatarUrl}
      />

      {/* Tabs */}
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
      />
    </div>
  );
}
