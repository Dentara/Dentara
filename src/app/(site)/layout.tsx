"use client";

import "@/globals.css";
import React, { useEffect, useState } from "react";
import PreLoader from "@/components/PreLoader";
import NextTopLoader from "nextjs-toploader";
import AuthProvider from "../context/AuthContext";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
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
      </body>
    </html>
  );
}
