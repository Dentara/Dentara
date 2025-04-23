import React from "react";
import Contact from "@/components/Contact";
import { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import Newsletter from "@/components/Newsletter";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Support Page - Crypto Next.js Template",
  description: "This is Support page for Crypto Next.js Template",
  // other metadata
};

const SupportPage = () => {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="Support" />

        <Contact sectionClasses="pb-[120px]" />

        <Newsletter />
      </DefaultLayout>
    </>
  );
};

export default SupportPage;
