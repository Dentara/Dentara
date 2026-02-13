// app/(site)/(self)/dashboard/doctor-self/notifications/page.tsx
import NotificationsPanel from "@/components/notifications/NotificationsPanel";

export const dynamic = "force-dynamic";

export default async function DoctorNotificationsPage() {
  return (
    <div className="p-6">
      <NotificationsPanel scope="doctor" />
    </div>
  );
}
