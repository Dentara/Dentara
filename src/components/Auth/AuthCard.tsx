// src/components/auth/AuthCard.tsx
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 border rounded-xl p-6 bg-white dark:bg-gray-900 shadow">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
