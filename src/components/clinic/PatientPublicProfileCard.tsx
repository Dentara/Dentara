"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertCircle,
  Globe2,
  Mail,
  MapPin,
  Phone,
  User2,
  Activity,
} from "lucide-react";

type PatientPublicProfile = {
  id: string;
  displayName: string | null;
  username: string | null;
  slug: string | null;
  headline: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  socialLinks: unknown;
  isPublic: boolean;
  location: {
    country: string | null;
    city: string | null;
  };
  contact: {
    email: string | null;
    phone: string | null;
  };
  privacy: {
    allowClinicProfileAccess: boolean;
    showEmailToClinics: boolean;
    showPhoneToClinics: boolean;
    showCityToClinics: boolean;
    showFullNamePublic: boolean;
    showAvatarPublic: boolean;
    showCityPublic: boolean;
  };
};

type Props = {
  patientId: string;
};

export function PatientPublicProfileCard({ patientId }: Props) {
  const [profile, setProfile] = useState<PatientPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/clinic/patients/${encodeURIComponent(
            patientId
          )}/public-profile`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Failed to load patient profile");
        }

        const j = await res.json();
        if (cancelled) return;
        setProfile(j.profile ?? null);
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError(err?.message || "Failed to load patient profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient profile</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No public profile is available for this patient.
        </CardContent>
      </Card>
    );
  }

  const { displayName, headline, location, contact, isPublic } = profile;

  return (
    <Card>
      {/* Cover / header */}
      <div className="h-16 w-full rounded-t-2xl bg-gradient-to-r from-sky-500/60 via-emerald-500/60 to-sky-500/60" />

      <CardHeader className="relative pb-2 pt-0">
        <div className="-mt-8 flex items-start gap-3">
          {/* Avatar + kliklə böyük şəkil */}
          {profile.avatarUrl ? (
            <a
              href={profile.avatarUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
              title="Open full-size photo"
            >
              <Avatar className="h-14 w-14 border border-border shadow-sm">
                <AvatarImage src={profile.avatarUrl} alt={displayName || "Patient"} />
                <AvatarFallback>
                  <User2 className="h-7 w-7 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </a>
          ) : (
            <div className="h-14 w-14 rounded-full bg-background border border-border flex items-center justify-center shadow-sm shrink-0">
              <User2 className="h-7 w-7 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {displayName || "Unnamed patient"}
                </div>
                {headline && (
                  <div className="text-xs text-muted-foreground truncate">
                    {headline}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={isPublic ? "default" : "outline"}
                  className="text-[0.65rem] px-2 py-0.5"
                >
                  {isPublic ? "Profile visible" : "Limited profile"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Contact & location */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {location.city && profile.privacy.showCityToClinics
                ? `${location.city}, `
                : ""}
              {location.country || "Location not shared"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <span className="truncate">
              {contact.email && profile.privacy.showEmailToClinics
                ? contact.email
                : "Email not shared"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span className="truncate">
              {contact.phone && profile.privacy.showPhoneToClinics
                ? contact.phone
                : "Phone not shared"}
            </span>
          </div>
          {profile.website && (
            <div className="flex items-center gap-1.5">
              <Globe2 className="h-3 w-3" />
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="truncate underline underline-offset-2"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-1.5 text-[0.65rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
            <Activity className="h-3 w-3" />
            Linked to this clinic
          </span>
          {profile.privacy.allowClinicProfileAccess ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 px-2 py-0.5">
              Profile access allowed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 px-2 py-0.5">
              Limited access
            </span>
          )}
        </div>

        {/* (İstəsən bu hissəni aktivləşdirərsən – hazır link) */}
        <div className="pt-1 border-t border-border/40 mt-2">
          <div className="flex flex-col gap-2 text-xs">
            <Link
              href={`/dashboard/clinic/patient-treatments/${encodeURIComponent(
                patientId
              )}`}
              className="inline-flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted transition"
            >
              <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3" />
                Open treatment history
              </span>
              <span className="text-[0.65rem] text-muted-foreground">
                /clinic/patient-treatments
              </span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
