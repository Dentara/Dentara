"use client";

import React, { useState } from "react";
import SlideOnReveal from "@/components/SlideOnReveal";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import { integrations, messages } from "../../../integrations.config";
import z from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

const Newsletter = ({ absoluteBg }: any) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const result = schema.safeParse({ email });

    if (!result.success) {
      result.error.errors.forEach((error) => {
        toast.error(error.message);
      });
      return;
    }

    if (integrations?.isMailchimpEnabled) {
      try {
        const res = await axios.post("/api/newsletter", { email });

        if (res.data.status == 400) {
          toast.error(res.data?.detail);
          setEmail("");
        } else {
          toast.success("Thanks for signing up!");
          setEmail("");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    } else {
      toast.error(messages.mailchimp);
    }
  };
  return (
    <>
      <section id="newsletter" className="relative z-10">
        {absoluteBg && (
          <div className="bg-light-bg absolute top-0 left-0 -z-10 h-[120px] w-full dark:bg-[#14102C]"></div>
        )}

        <div className="container">
          <SlideOnReveal delay={0.3}>
            <div
              className="wow fadeInUp bg-dark relative z-10 overflow-hidden rounded-sm p-8 sm:p-12"
              data-wow-delay="0s"
            >
              <div className="-mx-4 flex flex-wrap items-center">
                <div className="w-full px-4 lg:w-1/2">
                  <div className="mb-10 lg:mb-0">
                    <div className="max-w-[500px]">
                      <h2 className="mb-2 text-3xl leading-tight font-bold text-white md:text-[45px]">
                        Newsletter
                      </h2>
                      <p className="text-lg font-medium text-white">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Nam vitae quam nec ante aliquet fringilla vel at erat.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full px-3 lg:w-1/2">
                  <div>
                    <form className="relative" onSubmit={handleSubmit}>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Enter email address"
                        className="text-body-color-2 dark:text-body-color w-full rounded-full border border-transparent bg-white px-10 py-5 text-base font-medium outline-hidden sm:pr-24"
                      />
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 top-1/2 right-2.5 mt-5 inline-flex h-12 items-center rounded-full px-7 text-base font-medium text-white sm:absolute sm:mt-0 sm:-translate-y-1/2"
                      >
                        Submit
                        <span className="pl-1">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.67496 17.5L19.1666 10L1.67496 2.5L1.66663 8.33333L14.1666 10L1.66663 11.6667L1.67496 17.5Z"
                              fill="white"
                            />
                          </svg>
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="absolute top-0 right-0 -z-10">
                <Image
                  src="/images/shapes/newsletter-shape.svg"
                  alt="shape"
                  width={501}
                  height={220}
                />
              </div>
            </div>
          </SlideOnReveal>
        </div>
      </section>
    </>
  );
};

export default Newsletter;
