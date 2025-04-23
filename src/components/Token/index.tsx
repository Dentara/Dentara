"use client";

import React from "react";
import Graphics from "@/components/Token/Graphics";
import SlideOnReveal from "@/components/SlideOnReveal";
import TokenChart from "@/components/Token/TokenChart";

const Token = () => {
  return (
    <>
      <section className="relative z-10">
        <div className="container">
          <div className="rounded-lg bg-light-bg px-8 py-12 dark:bg-[#14102C] sm:px-14 sm:py-16 lg:px-8 xl:px-14">
            <div className="-mx-4 flex flex-wrap items-center">
              <div className="w-full px-4 lg:w-1/2">
                <SlideOnReveal delay={0.3}>
                  <div className="mx-auto mb-12 flex items-center justify-center sm:h-[390px] sm:w-[390px] lg:mb-0">
                    <TokenChart />
                  </div>
                </SlideOnReveal>
              </div>
              <div className="w-full px-4 lg:w-1/2">
                <SlideOnReveal delay={0.3}>
                  <div className="wow fadeInUp mb-9" data-wow-delay="0s">
                    <span className="mb-3 text-lg font-bold uppercase text-primary sm:text-xl">
                      TOKEN
                    </span>
                    <h2 className="mb-3 text-3xl font-bold leading-tight text-black dark:text-white md:text-[45px]">
                      Token Sale
                    </h2>
                    <p className="text-lg font-medium text-body-color-2 dark:text-body-color">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Phasellus condimentum tellus at lectus pulvinar, id auctor
                      felis iaculis. In vestibulum neque sem, at dapibus justo
                      facilisis in.
                    </p>
                  </div>
                </SlideOnReveal>

                <SlideOnReveal delay={0.3}>
                  <div className="wow fadeInUp space-y-4" data-wow-delay="0s">
                    <p className="flex">
                      <span className="mr-4 h-6 w-6 rounded-full bg-primary"></span>
                      <span className="text-lg font-medium text-body-color-2 dark:text-body-color">
                        73% Financial Overhead
                      </span>
                    </p>
                    <p className="flex">
                      <span className="mr-4 h-6 w-6 rounded-full bg-[#2347B9]"></span>
                      <span className="text-lg font-medium text-body-color-2 dark:text-body-color">
                        55% Bonus & found
                      </span>
                    </p>
                    <p className="flex">
                      <span className="mr-4 h-6 w-6 rounded-full bg-[#8BA6FF]"></span>
                      <span className="text-lg font-medium text-body-color-2 dark:text-body-color">
                        38% it infastrueture
                      </span>
                    </p>
                    <p className="flex">
                      <span className="mr-4 h-6 w-6 rounded-full bg-[#8696CA]"></span>
                      <span className="text-lg font-medium text-body-color-2 dark:text-body-color">
                        20.93% Gift Code Inventory
                      </span>
                    </p>
                  </div>
                </SlideOnReveal>
              </div>
            </div>
          </div>
        </div>

        <Graphics />
      </section>
    </>
  );
};

export default Token;
