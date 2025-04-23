import React from "react";
import HeroBrands from "@/components/HeroArea/HeroBrands";
import Link from "next/link";

const HeroContent = () => {
  return (
    <>
      <div className="mx-auto max-w-[720px] text-center">
        <h1 className="mb-4 text-3xl leading-tight font-bold text-black md:text-[45px] dark:text-white">
          Next.js Template and Boilerplate for Crypto, ICO and Web3
        </h1>
        <p className="text-body-color-2 mx-auto mb-4 max-w-[620px] text-lg font-medium dark:text-white">
          A Next.js website template for Crypto Currency, Blockchain, ICO, and
          Web3, meticulously styled with Tailwind CSS. This boilerplate includes
          essential integrations, UI components, pages, and enabling you to
          launch a comprehensive website or landing page for anything related to
          Crypto, Blockchain, and Web3.
        </p>

        <HeroBrands />

        <Link
          href="#"
          className="bg-primary hover:bg-primary/90 rounded-full px-8 py-3 text-base font-semibold text-white"
        >
          Buy Tokens 47% Off
        </Link>
      </div>
    </>
  );
};

export default HeroContent;
