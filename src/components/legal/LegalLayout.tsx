// components/legal/LegalLayout.tsx
import Link from "next/link";
import type { ReactNode } from "react";

type LegalLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function LegalLayout({ title, subtitle, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Tagiza Legal & Compliance
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              {subtitle}
            </p>
          )}
        </header>

        <div className="grid gap-6 md:grid-cols-[240px,1fr] items-start">
          {/* Sidebar nav */}
          <aside className="hidden md:block sticky top-10 self-start">
            <nav className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 py-4 text-sm">
              <div className="mb-3 font-semibold text-slate-800 dark:text-slate-100">
                Legal documents
              </div>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/legal/terms"
                    className="block rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/privacy"
                    className="block rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/medical-consent"
                    className="block rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Medical &amp; AI Consent
                  </Link>
                </li>
              </ul>

              <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
                <p className="mb-1">
                  These documents describe how Tagiza operates as a professional platform
                  for clinics, doctors and patients.
                </p>
                <p>
                  This content is provided for information only and does not constitute
                  formal legal advice.
                </p>
              </div>
            </nav>
          </aside>

          {/* Main content card */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm px-4 py-5 md:px-8 md:py-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
