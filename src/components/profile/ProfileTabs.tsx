"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import OverviewSection from "./sections/OverviewSection";
import ContactSection from "./sections/ContactSection";
import PreferencesSection from "./sections/PreferencesSection";
import SecuritySection from "./sections/SecuritySection";
import DevicesSection from "./sections/DevicesSection";
import DataSection from "./sections/DataSection";
import PublicProfileSection from "./sections/PublicProfileSection";

type Tab = { key: string; label: string };

export default function ProfileTabs({
  tabs,
  user,
  linkedClinicsCount,
  basePath = "/dashboard/patient-self",
  contextRole = "patient",
  apiBase = "/api/patient",
}: {
  tabs: Tab[];
  user: any;
  linkedClinicsCount: number;
  basePath?: string;
  contextRole?: "patient" | "doctor";
  apiBase?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const def = tabs[0]?.key || "overview";
  const [active, setActive] = React.useState<string>(sp.get("tab") || def);

  React.useEffect(() => {
    const cur = sp.get("tab") || def;
    setActive(cur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp?.toString()]);

  const onChange = (key: string) => {
    const params = new URLSearchParams(sp?.toString());
    params.set("tab", key);
    router.replace(`${pathname}?${params.toString()}`);
    setActive(key);
  };

  const renderActive = () => {
    switch (active) {
      case "contact":
        return <ContactSection user={user} apiBase={apiBase} />;
      case "preferences":
        return <PreferencesSection user={user} apiBase={apiBase} />;
      case "security":
        return <SecuritySection user={user} apiBase={apiBase} />;
      case "devices":
        return <DevicesSection apiBase={apiBase} />;
      case "data":
        return <DataSection apiBase={apiBase} />;
      case "public-profile":
        return <PublicProfileSection />;
      case "overview":
      default:
        return (
          <OverviewSection
            user={user}
            linkedClinicsCount={linkedClinicsCount}
            basePath={basePath}
            contextRole={contextRole}
            apiBase={apiBase}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "px-3 py-2 rounded-md text-sm border transition",
              active === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-6">{renderActive()}</CardContent>
      </Card>
    </div>
  );
}
