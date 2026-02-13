"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  BadgeCheck,
  Globe2,
  Mail,
  MapPin,
  Phone,
  User2,
} from "lucide-react";

type DoctorPublicProfile = {
  id: string;
  doctorId: string;
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
  doctorId: string;
};

export function DoctorPublicProfileCard({ doctorId }: Props) {
  const [profile, setProfile] = useState<DoctorPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/clinic/doctors/${encodeURIComponent(
            doctorId
          )}/public-profile`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Failed to load doctor profile");
        }

        const j = await res.json();
        if (cancelled) return;
        setProfile(j.profile ?? null);
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError(err?.message || "Failed to load doctor profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doctor profile</CardTitle>
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
          <CardTitle>Doctor profile</CardTitle>
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
          <CardTitle>Doctor profile</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No public profile is available for this doctor.
        </CardContent>
      </Card>
    );
  }

  const { displayName, headline, location, contact, isPublic } = profile;

  return (
    <Card>
      {/* Cover */}
      <div className="h-16 w-full rounded-t-2xl bg-gradient-to-r from-indigo-500/60 via-sky-500/60 to-indigo-500/60" />

      <CardHeader className="relative pb-2 pt-0">
        <div className="-mt-8 flex items-start gap-3">
          <div className="h-14 w-14 rounded-full bg-background border border-border flex items-center justify-center shadow-sm overflow-hidden">
            <User2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {displayName || "Unnamed doctor"}
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
                <Badge
                  variant="outline"
                  className="text-[0.65rem] px-2 py-0.5 inline-flex items-center gap-1"
                >
                  <BadgeCheck className="h-3 w-3" />
                  Linked doctor
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
              {location.city ? `${location.city}, ` : ""}
              {location.country || "Location not shared"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <span className="truncate">
              {contact.email || "Email not shared"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span className="truncate">
              {contact.phone || "Phone not shared"}
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

        {/* Quick meta */}
        <div className="flex flex-wrap gap-1.5 text-[0.65rem] text-muted-foreground">
          {profile.privacy.allowClinicProfileAccess ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 px-2 py-0.5">
              Profile access allowed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 px-2 py-0.5">
              Limited profile access
            </span>
          )}
        </div>

        {/* (Əgər sonradan doctor üçün ayrıca history səhifəsi qoysaq, buraya link əlavə edərik) */}
        <div className="pt-1 border-t border-border/40 mt-2 text-xs text-muted-foreground">
          <p>
            This card is for quickly understanding who this doctor is, outside of
            pure medical records.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
