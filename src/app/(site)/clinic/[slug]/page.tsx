import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfilePublicHeader from "@/components/profile/public/ProfilePublicHeader";
import RateClinicClient from "@/components/clinic/RateClinicClient";

type DoctorLite = { id: string; fullName: string | null };

type ClinicPublic = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
};

type ClinicReviewLite = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string; // ISO
};

type DoctorReviewLite = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string; // ISO
  doctorName: string | null;
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ---- Absolute URL + cookie-forward (SSR)
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const cookie = h.get("cookie") || "";
  const safeSlug = encodeURIComponent(slug);

  // ---- Public clinic + team + review agg/siyahıları
  const res = await fetch(`${proto}://${host}/api/public/clinic/${safeSlug}`, {
    cache: "no-store",
    headers: { cookie },
  }).catch(() => null);

  const data = (await res?.json().catch(() => null)) || {};
  const c: ClinicPublic | null = data?.item || null;
  const doctors: DoctorLite[] = data?.doctors || [];

  const clinicRatingAvg: number = data?.clinicRatingAvg ?? 0;
  const clinicRatingCount: number = data?.clinicRatingCount ?? 0;
  const clinicReviews: ClinicReviewLite[] = data?.clinicReviews ?? [];

  const doctorRatingAvg: number = data?.doctorRatingAvg ?? 0;
  const doctorRatingCount: number = data?.doctorRatingCount ?? 0;
  const doctorReviews: DoctorReviewLite[] = data?.doctorReviews ?? [];

  // ---- Session (server) — rola görə CTA/Rate düymələri
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;

  // Patient üçün Appointment hədəfi
  const target = `/dashboard/patient-self/appointments${
    c?.name ? `?clinicName=${encodeURIComponent(c.name)}` : ""
  }`;
  const appointmentHref =
    role === "patient"
      ? target
      : `/auth/signin?accountType=patient&callbackUrl=${encodeURIComponent(
          target
        )}`;

  return (
    <div className="px-4 py-10 max-w-5xl mx-auto">
      <ProfilePublicHeader
        title={c?.name || "Clinic"}
        rightSlot={
          <a
            href="/search?type=clinic"
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Back to search
          </a>
        }
      />

      {clinicRatingCount > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-amber-500">★★★★★</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {clinicRatingAvg.toFixed(1)} ({clinicRatingCount})
          </span>
        </div>
      )}

      {/* Only patients can rate the clinic */}
      {role === "patient" && c?.id ? (
        <RateClinicClient clinicId={c.id} />
      ) : null}

      {!c ? (
        <p className="text-gray-500 mt-6">Clinic not found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Overview + Team */}
          <div className="md:col-span-2 rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold mb-3">Overview</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Public clinic page. Below you can see the clinic team and request
              an appointment.
            </p>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Team</h4>
              {doctors.length === 0 ? (
                <p className="text-gray-500 text-sm">No doctors listed.</p>
              ) : (
                <ul className="space-y-2">
                  {doctors.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <span className="truncate">
                        {d.fullName || "Doctor"}
                      </span>
                      {d.fullName ? (
                        <a
                          className="text-blue-600 hover:underline"
                          href={`/doctor/${encodeURIComponent(d.fullName)}`}
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Details + Appointment CTA */}
          <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold mb-3">Details</h3>
            <dl className="text-sm space-y-2">
              <div className="flex">
                <dt className="w-28 text-gray-500">Email</dt>
                <dd className="flex-1 break-all">{c.email || "—"}</dd>
              </div>
              <div className="flex">
                <dt className="w-28 text-gray-500">Phone</dt>
                <dd className="flex-1">{c.phone || "—"}</dd>
              </div>
              <div className="flex">
                <dt className="w-28 text-gray-500">Address</dt>
                <dd className="flex-1">{c.address || "—"}</dd>
              </div>
              <div className="flex">
                <dt className="w-28 text-gray-500">Location</dt>
                <dd className="flex-1">
                  {c?.city || c?.country
                    ? [c?.city, c?.country].filter(Boolean).join(", ")
                    : "—"}
                </dd>
              </div>
              <div className="flex">
                <dt className="w-28 text-gray-500">Website</dt>
                <dd className="flex-1">
                  {c.website ? (
                    <a
                      href={
                        c.website.startsWith("http")
                          ? c.website
                          : `https://${c.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {c.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <a
                href={appointmentHref}
                className="inline-block w-full text-center px-4 py-2 rounded bg-blue-600 text-white"
                title={
                  role === "patient"
                    ? "Open appointment calendar"
                    : "You will be asked to sign in to book"
                }
              >
                {role === "patient"
                  ? "Open Appointment Calendar"
                  : "Request Appointment"}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Clinic reviews */}
      <div className="mt-10 rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-semibold mb-3">Clinic reviews</h3>
        {clinicReviews.length === 0 ? (
          <p className="text-sm text-gray-500">No clinic reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {clinicReviews.map((r) => (
              <li key={r.id} className="rounded border p-3 bg-amber-50/40">
                <div className="text-amber-500 text-sm">
                  {"★★★★★".slice(0, r.rating) + "☆☆☆☆☆".slice(0, 5 - r.rating)}
                </div>
                {r.comment && (
                  <div className="text-sm mt-1 italic">“{r.comment}”</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()} ·{" "}
                  {c?.name || "Clinic"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Doctor reviews inside this clinic */}
      <div className="mt-10 rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-semibold mb-3">Doctor reviews</h3>

        {doctorRatingCount > 0 && (
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            Average: {doctorRatingAvg.toFixed(1)} ({doctorRatingCount})
          </div>
        )}

        {doctorReviews.length === 0 ? (
          <p className="text-sm text-gray-500">No doctor reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {doctorReviews.map((r) => (
              <li key={r.id} className="rounded border p-3 bg-amber-50/40">
                <div className="text-amber-500 text-sm">
                  {"★★★★★".slice(0, r.rating) + "☆☆☆☆☆".slice(0, 5 - r.rating)}
                </div>
                {r.comment && (
                  <div className="text-sm mt-1 italic">“{r.comment}”</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                  {r.doctorName ? ` · ${r.doctorName}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
