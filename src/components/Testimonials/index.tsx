"use client";

import React from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";
import SlideOnReveal from "@/components/SlideOnReveal";

const testimonialData: Testimonial[] = [
  {
    quote:
      "I believe in lifelong learning and Learn. is a great place to learn from experts. I've learned a lot and recommend it to all my friends and familys.",
    authorImage: "/images/testimonials/image-01.jpg",
    authorName: "Jason Keys",
    authorRole: "CEO & Founder @ Dreampeet.",
  },
  {
    quote:
      "I believe in lifelong learning and Learn. is a great place to learn from experts. I've learned a lot and recommend it to all my friends and familys.",
    authorImage: "/images/testimonials/image-02.jpg",
    authorName: "Mariya Merry",
    authorRole: "CEO & Founder @ Betex.",
  },
  {
    quote:
      "I believe in lifelong learning and Learn. is a great place to learn from experts. I've learned a lot and recommend it to all my friends and familys.",
    authorImage: "/images/testimonials/image-03.jpg",
    authorName: "Andria Jolly",
    authorRole: "CEO & Founder @ CryptoX.",
  },
  {
    quote:
      "I believe in lifelong learning and Learn. is a great place to learn from experts. I've learned a lot and recommend it to all my friends and familys.",
    authorImage: "/images/testimonials/image-04.jpg",
    authorName: "Devid Willium",
    authorRole: "CEO & Founder @ Coinbase.",
  },
];

const Testimonials = () => {
  return (
    <>
      <section
        id="testimonial"
        className="bg-light-bg pt-[120px] pb-20 dark:bg-[#14102C]"
      >
        <div className="container">
          <SlideOnReveal delay={0.3}>
            <div
              className="wow fadeInUp mx-auto mb-16 max-w-[590px] text-center md:mb-20"
              data-wow-delay="0s"
            >
              <span className="text-primary mb-3 text-lg font-bold uppercase sm:text-xl">
                TESTIMONIALS
              </span>
              <h2 className="mb-3 text-3xl leading-tight font-bold text-black md:text-[45px] dark:text-white">
                What Our Client Say&apos;s
              </h2>
              <p className="text-body-color-2 dark:text-body-color text-lg font-medium">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                sed congue arcu, In et dignissim quam condimentum vel.
              </p>
            </div>
          </SlideOnReveal>

          <div className="-mx-4 flex flex-wrap">
            {testimonialData.map((item, index) => (
              <div key={index} className="w-full px-4 md:w-1/2">
                <SlideOnReveal delay={0.3}>
                  <div
                    className="wow fadeInUp relative z-10 mb-10 overflow-hidden rounded-[10px] bg-white px-6 py-8 sm:p-10 md:p-8 xl:p-10 dark:bg-[#131B4D]"
                    data-wow-delay="0s"
                  >
                    <div className="absolute top-0 right-0 z-[-1]">
                      <Image
                        src="/images/shapes/testimonial-shape.svg"
                        alt="shape"
                        width={254}
                        height={182}
                      />
                    </div>
                    <div className="mb-8 flex items-center">
                      <div className="mr-5 h-20 w-full max-w-[80px] overflow-hidden rounded-sm">
                        <Image
                          width={80}
                          height={80}
                          src={item.authorImage}
                          className={"h-full object-cover"}
                          alt="author"
                        />
                      </div>
                      <div className="w-full">
                        <h3 className="text-dark mb-1 text-lg font-semibold dark:text-white">
                          {item.authorName}
                        </h3>
                        <p className="text-body-color-2 text-sm font-medium dark:text-white">
                          {item.authorRole}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-body-color-2 dark:text-body-color text-base leading-snug font-medium">
                        “{item.quote}”
                      </p>
                    </div>
                  </div>
                </SlideOnReveal>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
