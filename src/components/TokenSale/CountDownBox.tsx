"use client";

import React from "react";
import CountDownTimer from "@/components/TokenSale/CountDownTimer";
import Image from "next/image";
import SlideOnReveal from "@/components/SlideOnReveal";
import { pricingData } from "@/stripe/pricingData";
import axios from "axios";
import { integrations, messages } from "../../../integrations.config";
import toast from "react-hot-toast";

const CountDownBox = () => {
  const handleSubscription = async (e: any) => {
    e.preventDefault();

    if (!integrations.isStripeEnabled) {
      toast.error(messages.stripe);
      return;
    }

    const { data } = await axios.post(
      "/api/payment",
      {
        priceId: pricingData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    window.location.assign(data);
  };

  return (
    <>
      <SlideOnReveal delay={0.3}>
        <div
          className="wow fadeInUp bg-dark rounded-lg px-8 py-12 sm:px-14 sm:py-16"
          data-wow-delay="0s"
        >
          <div className="mb-24">
            <CountDownTimer />
          </div>
          <div className="mb-8">
            <div className="relative z-20">
              <div className="relative h-8 w-full rounded-full bg-[#515A95]">
                <div className="bg-primary absolute bottom-0 left-0 h-full w-[75%] rounded-full"></div>

                <div className="absolute bottom-0 left-0 flex w-full justify-around">
                  <div className="group relative flex w-1/3 justify-center">
                    <div className="h-9 w-[2px] bg-[#384280]"></div>
                    <div className="absolute top-[-140%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#384280] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white opacity-0 group-hover:opacity-100">
                      <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#384280]"></span>
                      <span>PRE-SALE</span>
                    </div>
                  </div>
                  <div className="group relative flex w-1/3 justify-center">
                    <div className="h-9 w-[2px] bg-[#384280]"></div>
                    <div className="absolute top-[-140%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#384280] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white opacity-0 group-hover:opacity-100">
                      <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#384280]"></span>
                      <span>SOFT CAP</span>
                    </div>
                  </div>
                  <div className="group relative flex w-1/3 justify-center">
                    <div className="h-9 w-[2px] bg-[#384280]"></div>
                    <div className="absolute top-[-140%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#384280] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white opacity-0 group-hover:opacity-100">
                      <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#384280]"></span>
                      <span>BONUS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 text-center">
            <button
              onClick={handleSubscription}
              className="bg-primary/90 rounded-full px-8 py-3 text-base font-semibold text-white"
            >
              Buy Token Now
            </button>
          </div>
          <div className="text-center">
            <Image
              src="/images/sale-token/payment-method.svg"
              alt="payment-method"
              className="mx-auto dark:grayscale-0"
              width={281}
              height={32}
            />
          </div>
        </div>
      </SlideOnReveal>
    </>
  );
};

export default CountDownBox;
