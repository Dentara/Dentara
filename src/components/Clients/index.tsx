"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Client } from "@/types/client";
import SlideOnReveal from "@/components/SlideOnReveal";

const clientsData: Client[] = [
  {
    logo: "/images/brands/uideck.svg",
    logoWhite: "/images/brands/uideck-white.svg",
    name: "uideck",
    link: "https://uideck.com",
    width: 152,
    height: 40,
  },
  {
    logo: "/images/brands/tailgrids.svg",
    logoWhite: "/images/brands/TailGrids-white.svg",
    name: "tailgrids",
    link: "https://tailgrids.com",
    width: 170,
    height: 40,
  },
  {
    logo: "/images/brands/lineicons.svg",
    logoWhite: "/images/brands/LineIcons-white.svg",
    name: "lineicons",
    link: "https://lineicons.com",
    width: 165,
    height: 40,
  },
  {
    logo: "/images/brands/ayroui.svg",
    logoWhite: "/images/brands/AyroUI-white.svg",
    name: "ayroui",
    link: "https://ayroui.com",
    width: 156,
    height: 40,
  },
  {
    logo: "/images/brands/plainadmin.svg",
    logoWhite: "/images/brands/PlainAdmin-white.svg",
    name: "plainadmin",
    link: "https://plainadmin.com",
    width: 170,
    height: 40,
  },
];

const Clients = () => {
  return (
    <>
      <section>
        <div className="container">
          <SlideOnReveal delay={0.3}>
            <div className="border-y border-[#F3F4F4] pt-10 dark:border-[#2D2C4A]">
              <h2 className="mb-10 text-center text-lg font-bold text-black dark:text-white sm:text-2xl">
                Join the 20,000+ companies using the our platform
              </h2>

              <div className="-mx-4 flex flex-wrap items-center justify-center">
                {clientsData.map((item, index) => (
                  <div key={index} className="px-4">
                    <div className="mb-5 text-center">
                      <Link
                        target="_blank"
                        rel="nofollow noopenner"
                        href={item.link}
                        className="mb-10 flex max-w-[170px] justify-center opacity-70 grayscale hover:opacity-100 hover:grayscale-0 dark:hover:opacity-100"
                      >
                        <Image
                          width={item.width}
                          height={item.height}
                          priority
                          src={item.logoWhite}
                          alt={item.name}
                          className="mx-auto hidden h-10 text-center dark:block"
                        />
                        <Image
                          width={item.width}
                          height={item.height}
                          priority
                          src={item.logo}
                          alt={item.name}
                          className="mx-auto h-10 text-center dark:hidden"
                        />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SlideOnReveal>
        </div>
      </section>
    </>
  );
};

export default Clients;
