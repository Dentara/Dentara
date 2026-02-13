"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function PublicProfileSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Public profile & privacy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">
              Public profile configuration is temporarily disabled.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              We are refactoring this section to make patient and doctor profiles fully
              independent and stable. Your account still works, and clinics can only
              see the basic information allowed by your existing settings.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          You can continue using all other parts of the dashboard (appointments,
          treatments, files, etc.) without any risk of freezes or performance issues.
          This tab will be re-enabled later with a clean, Facebook-style profile
          card editor.
        </p>
      </CardContent>
    </Card>
  );
}
