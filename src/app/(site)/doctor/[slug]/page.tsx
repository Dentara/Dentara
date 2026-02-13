import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProfilePublicHeader from "@/components/profile/public/ProfilePublicHeader";

type DoctorPublic = {
  id: string;
  fullName: string | null;
  email?: string | null;
  specialization?: string | null;
  clinic?: { name?: string | null } | null;
  country?: string | null;
  city?: string | null;
};

type Cred = {
  id: string;
  title: string | null;
  issuedBy?: string | null;
  year?: number | null;
  isPublic: boolean;
  isVerified?: boolean | null;
  filePath?: string | null;
};

function isImagePath(p?: string | null) {
  if (!p) return false;
  const u = p.toLowerCase();
  return u.endsWith(".png") || u.endsWith(".jpg") || u.endsWith(".jpeg") || u.endsWith(".webp") || u.endsWith(".gif") || u.endsWith(".bmp");
}

function isPdfPath(p?: string | null) {
  return (p || "").toLowerCase().endsWith(".pdf");
}

function prettyTitle(raw?: string | null) {
  const t = (raw || "").trim();
  const name = t.split("/").pop() || t;
  return name.replace(/^\d+[_-]+/, "");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Absolute URL + cookie forward
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const cookie = h.get("cookie") || "";
  const safeSlug = encodeURIComponent(slug);

  const res = await fetch(`${proto}://${host}/api/public/doctor/${safeSlug}`, {
    cache: "no-store",
    headers: { cookie },
  }).catch(() => null);

  const data = await res?.json().catch(() => null);
  const d: DoctorPublic | null = data?.item || null;
  const credentials: Cred[] = data?.credentials || [];
  const avatarUrl: string | null = data?.avatarUrl || null;
  const ratingAvg: number = data?.ratingAvg ?? 0;
  const ratingCount: number = data?.ratingCount ?? 0;
  const reviews: Array<{ id: string; rating: number; comment: string | null; createdAt: string; clinicName: string | null }> = data?.reviews ?? [];

  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;

  const clinicName = d?.clinic?.name || "";
  const doctorName = d?.fullName || "";
  const target = `/dashboard/patient-self/appointments${
    clinicName || doctorName
      ? `?${[clinicName ? `clinicName=${encodeURIComponent(clinicName)}` : "", doctorName ? `doctorName=${encodeURIComponent(doctorName)}` : ""].filter(Boolean).join("&")}`
      : ""
  }`;
  const bookHref = role === "patient" ? target : `/auth/signin?accountType=patient&callbackUrl=${encodeURIComponent(target)}`;

  // Profil fotosunun fallback-ı (dicebear)
  const photo = avatarUrl
    ? avatarUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(d?.fullName || "Doctor")}`;

  return (
    <DefaultLayout>
      <div className="px-4 py-10 max-w-5xl mx-auto">
        <div className="flex items-start gap-4">
          <img
            src={photo}
            alt={d?.fullName || "Doctor"}
            className="w-16 h-16 rounded-full border object-cover"
            loading="lazy"
          />
          <ProfilePublicHeader
            title={d?.fullName || "Doctor"}
            subtitle={d?.specialization || ""}
            meta={d?.clinic?.name || undefined}
            rightSlot={
              <a
                href="/search?type=doctor"
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Back to search
              </a>
            }
          />
        </div>
        {ratingCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-amber-500">★★★★★</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {ratingAvg.toFixed(1)} ({ratingCount})
            </span>
          </div>
        )}
        {!d ? (
          <p className="text-gray-500 mt-6">Doctor not found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* About + Credentials */}
            <div className="md:col-span-2 rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {d.specialization ? `${d.specialization}.` : "Public profile. Future tabs: Posts · Reviews · Credentials."}
              </p>

              {/* Credentials (public) */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Credentials</h4>

                {!credentials || credentials.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No public credentials. (Clinics can verify this doctor’s credentials on request.)
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {credentials.map((c) => {
                      const img = isImagePath(c.filePath);
                      const pdf = isPdfPath(c.filePath);
                      const title = prettyTitle(c.title || c.filePath);

                      return (
                        <div key={c.id} className="rounded border overflow-hidden">
                          {/* Media preview */}
                          {img ? (
                            <a href={c.filePath!} target="_blank" rel="noreferrer" className="block">
                              <img src={c.filePath!} alt={title} className="w-full h-40 object-cover" loading="lazy" />
                            </a>
                          ) : pdf ? (
                            <div className="h-40 w-full grid place-items-center bg-gray-50 dark:bg-gray-800">
                              <span className="text-sm text-gray-600 dark:text-gray-300">PDF Document</span>
                            </div>
                          ) : (
                            <div className="h-40 w-full grid place-items-center bg-gray-50 dark:bg-gray-800">
                              <span className="text-sm text-gray-500">No preview</span>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="p-3 text-sm">
                            <div className="font-medium truncate" title={title}>
                              {title}
                              {c.isVerified ? (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">VERIFIED</span>
                              ) : null}
                            </div>
                            <div className="text-xs text-gray-500">
                              {[c.issuedBy, c.year ? String(c.year) : ""].filter(Boolean).join(" · ")}
                            </div>

                            <div className="mt-2">
                              {c.filePath ? (
                                <a href={c.filePath} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                  View
                                </a>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Contact + CTA */}
            <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
              <h3 className="font-semibold mb-3">Contact</h3>
              <dl className="text-sm space-y-2">
                <div className="flex">
                  <dt className="w-28 text-gray-500">Email</dt>
                  <dd className="flex-1 break-all">{d.email || "—"}</dd>
                </div>
                <div className="flex">
                  <dt className="w-28 text-gray-500">Clinic</dt>
                  <dd className="flex-1">{d?.clinic?.name || "—"}</dd>
                </div>
                <div className="flex">
                  <dt className="w-28 text-gray-500">Location</dt>
                  <dd className="flex-1">
                    {d?.city || d?.country
                      ? [d?.city, d?.country].filter(Boolean).join(", ")
                      : "—"}
                  </dd>
                </div>
              <div className="mt-4">
                <a
                  href={bookHref}
                  className="inline-block w-full text-center px-4 py-2 rounded bg-blue-600 text-white"
                  title={role === "patient" ? "Open appointment calendar" : "You will be asked to sign in to book"}
                >
                  {role === "patient" ? "Book an Appointment" : "Book with this Doctor"}
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="mt-10 rounded-2xl border p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-semibold mb-3">Patient reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No public reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded border p-3 bg-amber-50/40">
                  <div className="text-amber-500 text-sm">
                    {"★★★★★".slice(0, r.rating) + "☆☆☆☆☆".slice(0, 5 - r.rating)}
                  </div>
                  {r.comment && <div className="text-sm mt-1 italic">“{r.comment}”</div>}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                    {r.clinicName ? ` · ${r.clinicName}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
