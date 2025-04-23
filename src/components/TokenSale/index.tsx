"use client";

import React from "react";
import CountDownBox from "@/components/TokenSale/CountDownBox";
import HeroContent from "@/components/HeroArea/HeroContent";
import SlideOnReveal from "@/components/SlideOnReveal";

const tokenData = [
  {
    name: "Token Name",
    description: "ethereum",
  },
  {
    name: "Nominal Price",
    description: "1eth = 0.025USD",
  },
  {
    name: "Total Number of Token Produced",
    description: "7 BN smt",
  },
  {
    name: "Unsold Tokens",
    description: "Burn Smart Contrac",
  },
  {
    name: "Type of Token",
    description: "ERC-20",
  },
  {
    name: "Minimal transaction amount",
    description: "1 ETH/ 1 BTC/ 1 LTC",
  },
];

const TokenSale = () => {
  return (
    <>
      <section className="pb-[120px]">
        <div className="container">
          <SlideOnReveal delay={0.3}>
            <div
              className="wow fadeInUp mx-auto mb-16 max-w-[590px] text-center md:mb-20"
              data-wow-delay="0s"
            >
              <span className="mb-3 text-lg font-bold uppercase text-primary sm:text-xl">
                CRYPTO FEATURE
              </span>
              <h2 className="mb-3 text-3xl font-bold leading-tight text-black dark:text-white md:text-[45px]">
                Token Sale
              </h2>
              <p className="text-lg font-medium text-body-color-2 dark:text-body-color">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                sed congue arcu, In et dignissim quam condimentum vel.
              </p>
            </div>
          </SlideOnReveal>

          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-5/12">
              <SlideOnReveal delay={0.3}>
                <div className="wow fadeInUp mb-14 lg:mb-0" data-wow-delay="0s">
                  <h3 className="mb-12 text-2xl font-bold text-black dark:text-white">
                    Information About Tokens
                  </h3>
                  <div className="space-y-3">
                    {tokenData.map((item, index) => (
                      <p
                        key={index}
                        className="justify-between text-base font-semibold text-body-color-2 dark:text-body-color sm:flex"
                      >
                        <span className="block sm:inline-block">
                          {item.name}
                        </span>
                        <span className="block sm:inline-block">
                          {item.description}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </SlideOnReveal>
            </div>

            <div className="w-full px-4 lg:w-7/12">
              <CountDownBox />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TokenSale;
