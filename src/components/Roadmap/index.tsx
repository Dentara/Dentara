"use client";

import React from "react";
import SlideOnReveal from "@/components/SlideOnReveal";
import Graphics from "@/components/Roadmap/Graphics";
import Link from "next/link";
import { Roadmaps } from "@/types/roadmap";

const roadmapData: Roadmaps[] = [
  {
    rightAlign: true,
    date: "Feb 25, 2025",
    details:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed congue arcu, In et dignissim quam condimentum vel",
    btn: {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.7287 11.1771C16.5267 15.9986 11.6433 18.9329 6.82128 17.7306C2.00125 16.5285 -0.933006 11.6449 0.269537 6.82378C1.47102 2.00177 6.3544 -0.932704 11.175 0.269311C15.9966 1.47133 18.9307 6.35553 17.7286 11.1772L17.7287 11.1771H17.7287Z"
            fill="#F7931A"
          />
          <path
            d="M13.1113 8.32768C13.2804 7.19652 12.4193 6.58848 11.2416 6.18285L11.6237 4.65059L10.6909 4.41817L10.319 5.91009C10.0738 5.84893 9.82201 5.79131 9.57173 5.73418L9.94632 4.23242L9.01417 4L8.63193 5.53176C8.42902 5.48556 8.22972 5.4399 8.03636 5.39179L8.03744 5.38697L6.75117 5.06577L6.50305 6.06199C6.50305 6.06199 7.19507 6.22062 7.18048 6.23038C7.55819 6.32465 7.62649 6.57468 7.61515 6.77286L7.17998 8.51847C7.20599 8.52507 7.23973 8.53463 7.27695 8.54959C7.24584 8.54186 7.21272 8.53343 7.17836 8.5252L6.56841 10.9705C6.52225 11.0853 6.40509 11.2575 6.14101 11.1921C6.15036 11.2057 5.46309 11.0229 5.46309 11.0229L5 12.0906L6.2138 12.3932C6.43961 12.4498 6.66089 12.5091 6.87881 12.5648L6.49283 14.1146L7.42449 14.347L7.80672 12.8137C8.06124 12.8828 8.30824 12.9465 8.55005 13.0066L8.1691 14.5327L9.10188 14.7651L9.48781 13.2182C11.0783 13.5192 12.2743 13.3979 12.7776 11.9592C13.1833 10.801 12.7574 10.1329 11.9207 9.69725C12.5301 9.55669 12.9892 9.15584 13.1116 8.32781L13.1113 8.3276L13.1113 8.32768ZM10.9802 11.316C10.6919 12.4743 8.74179 11.8481 8.10952 11.6911L8.62171 9.63788C9.25394 9.79571 11.2814 10.1081 10.9802 11.316H10.9802ZM11.2686 8.3109C11.0057 9.36445 9.38257 8.8292 8.85604 8.69795L9.32041 6.83576C9.84694 6.96701 11.5426 7.21197 11.2687 8.3109H11.2686Z"
            fill="white"
          />
        </svg>
      ),
      link: "#",
      text: "Bitcoin",
      progress: 4.5,
    },
  },
  { empty: true },
  { empty: true },
  {
    rightAlign: false,
    date: "Jan 14, 2026",
    details:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed congue arcu, In et dignissim quam condimentum vel",
    btn: {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.7307 11.1771C16.5286 15.9986 11.6446 18.9329 6.82205 17.7306C2.00148 16.5285 -0.933111 11.6449 0.269567 6.82378C1.47119 2.00177 6.35511 -0.932704 11.1762 0.269311C15.9985 1.47133 18.9329 6.35553 17.7306 11.1772L17.7307 11.1771H17.7307Z"
            fill="#1181E7"
          />
          <g clipPath="url(#clip0_27_564)">
            <path
              d="M8.99897 4L8.93188 4.22789V10.84L8.99897 10.907L12.0682 9.09273L8.99897 4Z"
              fill="#D6D6D6"
            />
            <path
              d="M8.99899 4L5.92969 9.09273L8.99899 10.907V7.69762V4Z"
              fill="white"
            />
            <path
              d="M8.99899 11.4881L8.96118 11.5342V13.8896L8.99899 13.9999L12.0701 9.6748L8.99899 11.4881Z"
              fill="#D6D6D6"
            />
            <path
              d="M8.99899 13.9999V11.4881L5.92969 9.6748L8.99899 13.9999Z"
              fill="white"
            />
            <path
              d="M8.99902 10.907L12.0682 9.09274L8.99902 7.69763V10.907Z"
              fill="#F3F3F3"
            />
            <path
              d="M5.92969 9.09274L8.99899 10.907V7.69763L5.92969 9.09274Z"
              fill="#E2E2E2"
            />
          </g>
          <defs>
            <clipPath id="clip0_27_564">
              <rect
                width="10"
                height="10"
                fill="white"
                transform="translate(4 4)"
              />
            </clipPath>
          </defs>
        </svg>
      ),
      link: "#",
      text: "ethereum",
      progress: 2.5,
    },
  },
  {
    rightAlign: true,
    date: "Mar 30, 2028",
    details:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed congue arcu, In et dignissim quam condimentum vel",
    btn: {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.7287 11.1771C16.5267 15.9986 11.6433 18.9329 6.82128 17.7306C2.00125 16.5285 -0.933006 11.6449 0.269537 6.82378C1.47102 2.00177 6.3544 -0.932704 11.175 0.269311C15.9966 1.47133 18.9307 6.35553 17.7286 11.1772L17.7287 11.1771H17.7287Z"
            fill="#295ADA"
          />
          <path
            d="M9 4L8.15344 4.47477L5.84656 5.77523L5 6.25V10.75L5.84656 11.2248L8.1746 12.5252L9.02116 13L9.86772 12.5252L12.1534 11.2248L13 10.75V6.25L12.1534 5.77523L9.84656 4.47477L9 4ZM6.69312 9.80046V7.19954L9 5.89908L11.3069 7.19954V9.80046L9 11.1009L6.69312 9.80046Z"
            fill="white"
          />
        </svg>
      ),
      link: "#",
      text: "chainlink",
      progress: 4.5,
    },
  },
  { empty: true },
  { empty: true },
  {
    rightAlign: false,
    date: "Dec 19, 2028",
    details:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed congue arcu, In et dignissim quam condimentum vel",
    btn: {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.7307 11.1771C16.5286 15.9986 11.6446 18.9329 6.82205 17.7306C2.00148 16.5285 -0.933111 11.6449 0.269567 6.82378C1.47119 2.00177 6.35511 -0.932704 11.1762 0.269311C15.9985 1.47133 18.9329 6.35553 17.7306 11.1772L17.7307 11.1771H17.7307Z"
            fill="#8247E5"
          />
          <path
            d="M11.5718 7.75074C11.389 7.64392 11.154 7.64392 10.9452 7.75074L9.48303 8.63205L8.49086 9.19288L7.05483 10.0742C6.87206 10.181 6.63708 10.181 6.4282 10.0742L5.30548 9.37982C5.12272 9.273 4.99217 9.05935 4.99217 8.81899V7.48368C4.99217 7.27003 5.09661 7.05638 5.30548 6.92285L6.4282 6.25519C6.61097 6.14837 6.84595 6.14837 7.05483 6.25519L8.17755 6.94956C8.36031 7.05638 8.49086 7.27003 8.49086 7.51039V8.39169L9.48303 7.80415V6.89614C9.48303 6.68249 9.37859 6.46884 9.16971 6.33531L7.08094 5.08012C6.89817 4.97329 6.66319 4.97329 6.45431 5.08012L4.31332 6.36202C4.10444 6.46884 4 6.68249 4 6.89614V9.40653C4 9.62018 4.10444 9.83383 4.31332 9.96736L6.4282 11.2226C6.61097 11.3294 6.84595 11.3294 7.05483 11.2226L8.49086 10.368L9.48303 9.78042L10.9191 8.92582C11.1018 8.81899 11.3368 8.81899 11.5457 8.92582L12.6684 9.59347C12.8512 9.7003 12.9817 9.91395 12.9817 10.1543V11.4896C12.9817 11.7033 12.8773 11.9169 12.6684 12.0504L11.5718 12.7181C11.389 12.8249 11.154 12.8249 10.9452 12.7181L9.82245 12.0504C9.63969 11.9436 9.50914 11.73 9.50914 11.4896V10.635L8.51697 11.2226V12.1039C8.51697 12.3175 8.62141 12.5312 8.83029 12.6647L10.9452 13.9199C11.1279 14.0267 11.3629 14.0267 11.5718 13.9199L13.6867 12.6647C13.8695 12.5579 14 12.3442 14 12.1039V9.56677C14 9.35312 13.8956 9.13947 13.6867 9.00594L11.5718 7.75074Z"
            fill="white"
          />
        </svg>
      ),
      link: "#",
      text: "polygon",
      progress: 2.5,
    },
  },
];

const Roadmap = () => {
  return (
    <>
      <section id="roadmap" className="relative z-10 py-[120px]">
        <div className="container">
          <SlideOnReveal delay={0.3}>
            <div
              className="wow fadeInUp mx-auto mb-16 max-w-[590px] text-center md:mb-20"
              data-wow-delay="0s"
            >
              <span className="mb-3 text-lg font-bold uppercase text-primary sm:text-xl">
                ROADMAP
              </span>
              <h2 className="mb-3 text-3xl font-bold leading-tight text-black dark:text-white md:text-[45px]">
                The Timeline
              </h2>
              <p className="text-lg font-medium text-body-color-2 dark:text-body-color">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                sed congue arcu, In et dignissim quam condimentum vel.
              </p>
            </div>
          </SlideOnReveal>

          <div className="-mx-4 flex justify-center">
            <div className="w-full px-4 lg:w-10/12 xl:w-9/12">
              <SlideOnReveal delay={0.3}>
                <div
                  className="wow fadeInUp relative -mx-4 flex flex-wrap md:py-14 lg:py-20"
                  data-wow-delay="0s"
                >
                  <span className="absolute left-2 top-0 hidden h-full w-[2px] bg-light-bg dark:bg-[#2D2C4A] md:left-1/2 md:block"></span>
                  {roadmapData.map((item, index) =>
                    item.empty ? (
                      <div key={index} className="w-full px-4 md:w-1/2"></div>
                    ) : (
                      <div key={index} className="w-full px-4 md:w-1/2">
                        <div
                          className={`${item.rightAlign ? " md:mr-3 md:text-right lg:mr-5" : "md:ml-3 lg:ml-5"} relative z-10 mb-10 rounded-lg bg-light-bg px-6 py-8 dark:bg-dark md:mb-0`}
                        >
                          {item.rightAlign ? (
                            <>
                              <span className="absolute left-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full border-4 border-primary bg-white dark:border-body-color md:-right-9 md:left-auto md:block lg:-right-11"></span>
                              <span className="absolute -right-1 top-1/2 hidden h-3 w-3 -translate-y-1/2 rotate-45 bg-light-bg dark:bg-dark md:block"></span>
                            </>
                          ) : (
                            <>
                              <span className="absolute left-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full border-4 border-primary bg-white dark:border-body-color md:-left-9 md:right-auto md:block lg:-left-11"></span>
                              <span className="absolute -left-1 top-1/2 hidden h-3 w-3 -translate-y-1/2 rotate-45 bg-light-bg dark:bg-dark md:block"></span>
                            </>
                          )}

                          <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
                            {item.date}
                          </h3>
                          <p className="mb-5 text-base font-medium text-body-color-2 dark:text-body-color">
                            {item.details}
                          </p>

                          {item.btn && (
                            <Link
                              href={item.btn.link}
                              className="inline-flex items-center justify-center rounded-full bg-white p-2 pr-3"
                            >
                              <span className="pr-1">{item.btn.icon}</span>
                              <span className="pr-2 text-xs font-semibold text-body-color-2 dark:text-body-color">
                                {item.btn.text}
                              </span>

                              <span className="text-[8px] font-semibold text-body-color-2 dark:text-[#959595]">
                                {item.btn.progress}%
                              </span>
                              <span>
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M1.66675 5.00008L2.25425 5.58758L4.58341 3.26258V8.33341H5.41675V3.26258L7.74175 5.59175L8.33341 5.00008L5.00008 1.66675L1.66675 5.00008Z"
                                    fill="#60D16B"
                                  />
                                </svg>
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </SlideOnReveal>
            </div>
          </div>
        </div>

        <Graphics />
      </section>
    </>
  );
};

export default Roadmap;
