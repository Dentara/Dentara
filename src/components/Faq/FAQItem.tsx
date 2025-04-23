import React from "react";
import SlideOnReveal from "@/components/SlideOnReveal";

type FaqData = {
  activeFaq: number;
  id: number;
  handleFaqToggle: (id: number) => void;
  title: string;
  details: string;
};

const FAQItem = ({ faqData }: { faqData: FaqData }) => {
  const { activeFaq, id, handleFaqToggle, title, details } = faqData;

  return (
    <>
      <SlideOnReveal delay={0.3}>
        <div className="single-faq wow fadeInUp mb-10 rounded-lg bg-white px-7 py-6 dark:bg-dark md:px-10 md:py-8">
          <button
            onClick={() => {
              handleFaqToggle(id);
            }}
            className="faq-btn flex w-full items-center justify-between text-left"
          >
            <h3 className="mr-2 text-base font-bold text-dark dark:text-white sm:text-lg md:text-xl">
              {title}
            </h3>

            <span
              className={`${activeFaq === id && "rotate-180"} icon inline-flex h-5 w-full max-w-[20px] items-center justify-center rounded-sm bg-body-color-2 text-lg font-semibold text-white dark:bg-body-color dark:text-black`}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_50_132)">
                  <path
                    d="M8.82033 1.91065L4.99951 5.73146L1.17869 1.91064L-0.000488487 3.08978L4.99951 8.08978L9.99951 3.08979L8.82033 1.91065Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_50_132">
                    <rect
                      width="10"
                      height="10"
                      fill="white"
                      transform="translate(-0.000488281 0.000488281)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </button>

          {activeFaq === id && (
            <div className="faq-content">
              <p className="text-relaxed pt-6 text-base text-body-color-2 dark:text-body-color">
                {details}
              </p>
            </div>
          )}
        </div>
      </SlideOnReveal>
    </>
  );
};

export default FAQItem;
