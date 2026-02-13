import "@/globals.css";
import React, { useEffect, useState } from "react";
import PreLoader from "@/components/PreLoader";
import NextTopLoader from "nextjs-toploader";
import AuthProvider from "../context/AuthContext";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tagiza",
    template: "%s | Tagiza",
  },
  description:
    "Tagiza – AI-powered global dental and orthodontic platform for clinics, doctors and patients.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextTopLoader
          color="#006BFF"
          crawlSpeed={300}
          showSpinner={false}
          shadow="none"
        />

        <ThemeProvider
          enableSystem={false}
          attribute="class"
          defaultTheme="light"
        >
          <AuthProvider>
            {loading ? <PreLoader /> : <>{children}</>}
          </AuthProvider>
        </ThemeProvider>

        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
