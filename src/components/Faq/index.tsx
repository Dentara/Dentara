"use client";

import React, { useState } from "react";
import Graphics from "@/components/Faq/Graphics";
import faqData from "./faqData";
import FAQItem from "./FAQItem";
import SlideOnReveal from "@/components/SlideOnReveal";

const Faq = () => {
  const [activeFaq, setActiveFaq] = useState(0);

  const handleFaqToggle = (index: number) => {
    activeFaq === index ? setActiveFaq(0) : setActiveFaq(index);
  };

  return (
    <>
      <section
        id="faq"
        className="relative z-10 bg-light-bg py-24 dark:bg-[#14102C]"
      >
        <div className="container">
          <SlideOnReveal delay={0.3}>
            <div
              className="wow fadeInUp mx-auto mb-16 max-w-[630px] text-center md:mb-20"
              data-wow-delay="0s"
            >
              <span className="mb-3 text-lg font-bold uppercase text-primary sm:text-xl">
                FAQ
              </span>
              <h2 className="mb-3 text-3xl font-bold leading-tight text-black dark:text-white md:text-[45px]">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-[590px] text-lg font-medium text-body-color-2 dark:text-body-color">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                sed congue arcu, In et dignissim quam condimentum vel.
              </p>
            </div>
          </SlideOnReveal>

          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-9/12 xl:w-8/12">
              {faqData.map((faq, index) => (
                <FAQItem
                  key={index}
                  faqData={{ ...faq, activeFaq, handleFaqToggle }}
                />
              ))}
            </div>
          </div>
        </div>

        {/*Graphics.tsx*/}
        <Graphics />
      </section>
    </>
  );
};

export default Faq;
